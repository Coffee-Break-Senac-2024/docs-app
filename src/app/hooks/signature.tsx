import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import AuthService from "../components/services/AuthService";
import { signatureApi } from "../api/auth-api";
import { AxiosError } from "axios";

interface UserSignatureResponse {
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
    const [error, setError] = useState<string | null>(null);

    const getToken = async () => {
        return await AuthService.getToken();
    }

    const getSignature = useCallback(async () => {
        try {
            const token = await getToken();
            console.log(token, 'token');
            setLoading(true);
            const response = await signatureApi.get(`/api/user/signature`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            console.log(response.data, 'response');
            setData({ signatureType: response.data.signature, signetAt: response.data.signetAt, documentCount: response.data.documentCount });
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
            const token = getToken();
            setLoading(true);
            const response = await signatureApi.post(`/api/user/signature`, {
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
