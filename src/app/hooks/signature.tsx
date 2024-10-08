import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import AuthService from "../components/services/AuthService";
import { api } from "../api/api";
import { AxiosError } from "axios";

type UserSignatureResponse = {
    signatureType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
    signetAt: string,
    documentCount: number
}

interface UserSignatureRequest {
    signatureType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
}

interface SignatureContextData {
    userSignature: UserSignatureResponse,
    getSignature: () => Promise<void>,
    assignSignature: (data: UserSignatureRequest) => Promise<number | undefined>
}

const SignatureContext = createContext<SignatureContextData>({} as SignatureContextData);

const SignatureProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<UserSignatureResponse>({} as UserSignatureResponse);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const getToken = async () => {
            const token = await AuthService.getToken();
            setToken(token);
        }
        getToken();
    }, [])


    const getSignature = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/user/signature`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setData(response.data);
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message || 'Erro ao buscar assinatura');
            }
        } finally {
            setLoading(false);
        }
    }, [])

    const assignSignature = useCallback(async ({ signatureType }: UserSignatureRequest): Promise<number | undefined> => {
        try {
            setLoading(true);
            const response = await api.post(`/api/user/signature`, {
                signatureType
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.status;
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message || 'Erro ao atribuir assinatura');
                return error.response?.data.status || 500;
            }
        } finally {
            setLoading(false);
        }
    }, [])

    return (
        <SignatureContext.Provider value={{ userSignature: data, getSignature, assignSignature }}>
            {children}
        </SignatureContext.Provider>
    )
}

function useSignature(): SignatureContextData {
    const context = useContext(SignatureContext)

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export { SignatureProvider, useSignature }