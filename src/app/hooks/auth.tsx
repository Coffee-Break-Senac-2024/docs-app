import { createContext, useCallback, useState, useEffect } from "react";
import { api } from "../api/auth-api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { useSignature } from './signature';

interface Credentials {
    email: string;
    password: string;
}

interface AuthState {
    token: string;
}

interface AuthContextData {
    signIn(credentials: Credentials): Promise<number>;
    signOut(): Promise<void>;
    signUp(credentials: { name: string; document: string; email: string; password: string; }): Promise<number>;
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
    const { getSignature } = useSignature();

    useEffect(() => {
        const loadStorageData = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('@docs:token');
                if (token) {
                    setData({ token });
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (err) {
                console.error('Erro ao carregar dados do AsyncStorage:', err);
                setIsLoggedIn(false);
            } finally {
                setLoading(false);
            }
        };
        loadStorageData();
    }, []);
    
    

    const signIn = useCallback(async ({ email, password }: Credentials): Promise<number> => {
        setError(null);
        try {
            setLoading(true);
            const response = await api.post(`/api/user/auth`, { email, password });
    
            if (response.status === 200 || response.status === 201) {
                const { access_token } = response.data;
                await AsyncStorage.setItem('@docs:token', access_token);
    
                setData({ token: access_token });
                setCachedCredentials({ email, password });
                setIsLoggedIn(true); 
                return response.status;
            } else {
                throw new Error('Falha na autenticação.');
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message || 'Erro ao fazer login. Tente novamente.');
                return error.response?.status || 500;
            } else {
                setError('Erro desconhecido. Tente novamente.');
                return 500;
            }
        } finally {
            setLoading(false);
        }
    }, []);
    

    const signUp = useCallback(async ({ name, document, email, password }: { name: string; document: string; email: string; password: string; }): Promise<number> => {
        setError(null);
        try {
            setLoading(true);
            const response = await api.post(`/api/user/create`, { name, document, email, password });

            if (response.status === 200 || response.status === 201) {
                const { access_token } = response.data;
                await AsyncStorage.setItem('@docs:token', access_token);
                setData({ token: access_token });
                setCachedCredentials({ email, password });
                setIsLoggedIn(true);
                return response.status;
            } else {
                throw new Error('Erro ao tentar cadastrar.');
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message || 'Erro ao cadastrar. Tente novamente.');
                return error.response?.status || 500;
            } else {
                setError('Erro desconhecido. Tente novamente.');
                return 500;
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
