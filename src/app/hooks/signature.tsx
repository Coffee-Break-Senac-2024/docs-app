import { createContext, useCallback, useContext, useState } from "react";
import { signatureApi } from "../api/signature-api"; 
import { AxiosError } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'; 

type UserSignatureResponse = {
    signatureType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
    signetAt: string;
    documentCount: number;
}

interface UserSignatureRequest {
    signatureType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
}

interface SignatureContextData {
    userSignature: UserSignatureResponse;
    getSignature: () => Promise<void>;
    assignSignature: (data: UserSignatureRequest) => Promise<number | undefined>;
}

const SignatureContext = createContext<SignatureContextData>({} as SignatureContextData);

const SignatureProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<UserSignatureResponse>({} as UserSignatureResponse);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getToken = async (): Promise<string | null> => {
        try {
            const token = await AsyncStorage.getItem('@docs:token');
            console.log("TOKEEEEN: " + token)
            return token;
        } catch (error) {
            console.error('Erro ao obter o token do AsyncStorage:', error);
            return null;
        }
    };

    const getSignature = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            console.log("TOKEEEEN 2: " + token)
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }
            console.log("DAAAAAAAAAATTTTTTAAAAAAA" + response)
            const response = await signatureApi.get('/api/user/signature', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("DAAAAAAAAAATTTTTTAAAAAAA" + response)

            setData(response.data);
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message || 'Erro ao buscar assinatura');
            } else {
                setError('Erro desconhecido ao buscar assinatura.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const assignSignature = useCallback(
        async ({ signatureType }: UserSignatureRequest): Promise<number | undefined> => {
            try {
                setLoading(true);
                const token = await getToken();
                if (!token) {
                    throw new Error('Token de autenticação não encontrado');
                }

                const response = await signatureApi.post(
                    `/api/user/signature`,
                    { signatureType },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                return response.status;
            } catch (error) {
                if (error instanceof AxiosError) {
                    setError(error.response?.data.message || 'Erro ao atribuir assinatura');
                    return error.response?.status || 500;
                }
                setError('Erro desconhecido ao atribuir assinatura.');
                return 500;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return (
        <SignatureContext.Provider value={{ userSignature: data, getSignature, assignSignature }}>
            {children}
        </SignatureContext.Provider>
    );
};

function useSignature(): SignatureContextData {
    const context = useContext(SignatureContext);

    if (!context) {
        throw new Error('useSignature must be used within a SignatureProvider');
    }

    return context;
}

export { SignatureProvider, useSignature };
