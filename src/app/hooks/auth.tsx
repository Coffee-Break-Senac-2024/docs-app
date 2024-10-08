import { createContext, useCallback, useState } from "react";
import AuthService from "../components/services/AuthService";
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
    data: AuthState;
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

    const signIn = useCallback(async ({ email, password }: Credentials) => {
        try {
            setLoading(true);
            const response = await api.post(`/api/user/auth`, {
                email,
                password
            });

            const { access_token } = response.data;
            await AsyncStorage.setItem('@docs:token', access_token);
            setData({ token: access_token });
            setCachedCredentials({ email, password });
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(async () => {
        await AsyncStorage.removeItem('@docs:token');

        setData({} as AuthState);
    }, [])

    return (
        <AuthContext.Provider value={{
            signIn,
            signOut,
            data,
            loading,
            error,
            cachedCredentials
        }}>
            {children}
        </AuthContext.Provider>
    )
}