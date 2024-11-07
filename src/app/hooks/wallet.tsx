import { createContext, useCallback, useContext, useState } from "react";
import { walletApi } from "../api/wallet-api";
import { AxiosError } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WalletDocumentRequest {
    file: File | string;
    documentName: string;
    walletDocumentType: string;
}

interface WalletContextData {
    createDocument: (data: WalletDocumentRequest) => Promise<number | undefined>;
    error: string | null;
}

const WalletContext = createContext<WalletContextData>({} as WalletContextData);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getToken = async (): Promise<string | null> => {
        try {
            const token = await AsyncStorage.getItem('@docs:token');
            return token;
        } catch (error) {
            console.error('Erro ao obter o token do AsyncStorage:', error);
            return null;
        }
    };

    const createDocument = useCallback(
        async ({ file, documentName, walletDocumentType }: WalletDocumentRequest): Promise<number | undefined> => {
            try {
                console.log("Resposta da API:");
                setLoading(true);
                const token = await getToken();
                if (!token) {
                    throw new Error('Token de autenticação não encontrado');
                }

                const formData = new FormData();
                formData.append('file', file); 
                formData.append('documentName', documentName);
                formData.append('walletDocumentType', walletDocumentType);

                const response = await walletApi.post('/api/user/wallet/create', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log("Resposta da API:", JSON.stringify(response.data, null, 2));


                if (response.status === 201) {
                    setError(null);
                    return response.status;
                } else {
                    setError('Erro ao cadastrar documento');
                    return response.status;
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    setError(error.response?.data.message || 'Erro ao cadastrar documento');
                    return error.response?.status || 500;
                }
                setError('Erro desconhecido ao cadastrar documento');
                return 500;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return (
        <WalletContext.Provider value={{ createDocument, error }}>
            {children}
        </WalletContext.Provider>
    );
};

function useWallet(): WalletContextData {
    const context = useContext(WalletContext);

    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }

    return context;
}

export { WalletProvider, useWallet };
