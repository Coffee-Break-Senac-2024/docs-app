import { createContext, useCallback, useState, useEffect } from "react";
import { api } from "../api/auth-api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";

interface Credentials {
    email: string;
    password: string;
}

interface AuthState {
    token: string;
}

interface AuthContextData {
    signIn(credentials: Credentials): Promise<void>;
    signOut(): Promise<void>;
    signUp(credentials: { name: string; cpf: string; email: string; password: string; }): Promise<void>;
    isLoggedIn: boolean; 
    loading: boolean;
    error: string | null;
    cachedCredentials: Credentials;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<AuthState>({} as AuthState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cachedCredentials, setCachedCredentials] = useState<Credentials>({} as Credentials);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);  

    useEffect(() => {
        const loadStorageData = async () => {
            const token = await AsyncStorage.getItem('@docs:token');
            if (token) {
                setData({ token });
                setIsLoggedIn(true);
            }
        };
        loadStorageData();
    }, []);

    const signIn = useCallback(async ({ email, password }: Credentials) => {
        try {
            setLoading(true);
            const response = await api.post(`/api/user/auth`, {
                email,
                password
            });
    
            if (response.status === 200 || response.status === 201) {
                const { access_token } = response.data;
                await AsyncStorage.setItem('@docs:token', access_token);
                setData({ token: access_token });
                setCachedCredentials({ email, password });
                setIsLoggedIn(true);
            } else {
                throw new Error('Falha na autenticação.');
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message || 'Erro ao fazer login. Tente novamente.');
            } else {
                setError('Erro desconhecido. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const signUp = useCallback(async ({ name, cpf, email, password }: { name: string; cpf: string; email: string; password: string; }) => {
        try {
            setLoading(true);
            const response = await api.post(`/api/user/register`, {
                name,
                cpf,
                email,
                password
            });
    
            if (response.status === 200 || response.status === 201) {
                const { access_token } = response.data;
                await AsyncStorage.setItem('@docs:token', access_token);
                setData({ token: access_token });
                setCachedCredentials({ email, password });
                setIsLoggedIn(true);
            } else {
                throw new Error('Erro ao tentar cadastrar.');
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message || 'Erro ao cadastrar. Tente novamente.');
            } else {
                setError('Erro desconhecido. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(async () => {
        await AsyncStorage.removeItem('@docs:token');
        setData({} as AuthState);
        setIsLoggedIn(false);
    }, []);

    return (
        <AuthContext.Provider value={{
            signIn,
            signOut,
            signUp,
            isLoggedIn,
            loading,
            error,
            cachedCredentials
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
