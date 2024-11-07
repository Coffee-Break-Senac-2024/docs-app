import { createContext, useCallback, useContext, useState } from "react";
import { signatureApi } from "../api/signature-api"; 
import { AxiosError } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'; 

type UserSignatureResponse = {
    signature: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
    signedAt: string;
    documentCount: number;
} | null; 

interface UserSignatureRequest {
    signature: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
}

interface SignatureContextData {
    userSignature: UserSignatureResponse; 
    getSignature: () => Promise<void>;
    assignSignature: (data: UserSignatureRequest) => Promise<number | undefined>;
    changeSignaturePlan: (data: UserSignatureRequest) => Promise<number | undefined>; // Novo método
    error: string | null; 
}

const SignatureContext = createContext<SignatureContextData>({} as SignatureContextData);

const SignatureProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<UserSignatureResponse>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getToken = async (): Promise<string | null> => {
        try {
            const token = await AsyncStorage.getItem('@docs:token');
            console.log("TOKEEEEN: " + token);
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
    
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }
    
            const response = await signatureApi.get('/api/user/signature', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            console.log("STATUS:::", JSON.stringify(response.data, null, 2));

            if (response.status === 200) {
                setData(response.data);
                setError(null);
            } else {
                setData(null); 
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                setData(null);
            } else {
                setData(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);
    
    const assignSignature = useCallback(
        async ({ signature }: UserSignatureRequest): Promise<number | undefined> => {
            try {
                setLoading(true);
                const token = await getToken();
                if (!token) {
                    throw new Error('Token de autenticação não encontrado');
                }
    
                const response = await signatureApi.post(
                    '/api/user/signature/assign', 
                    { signature },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
    
                console.log("STATUS:::" + response.status);
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

   
    const changeSignaturePlan = useCallback(
        async ({ signature }: UserSignatureRequest): Promise<number | undefined> => {
            try {
                setLoading(true);
                const token = await getToken();
                if (!token) {
                    throw new Error('Token de autenticação não encontrado');
                }
            console.log("MUDAR ASSINATURA" + token +"ss: " + signature);
                const response = await signatureApi.patch(
                    '/api/user/signature/change', 
                    { signature },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    setData(response.data); 
                    setError(null);
                }

                console.log("Plano alterado com sucesso:", response.data);
                return response.status;
            } catch (error) {
                if (error instanceof AxiosError) {
                    setError(error.response?.data.message || 'Erro ao alterar assinatura');
                    return error.response?.status || 500;
                }
                setError('Erro desconhecido ao alterar assinatura.');
                return 500;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return (
        <SignatureContext.Provider value={{ userSignature: data, getSignature, assignSignature, changeSignaturePlan, error }}>
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
