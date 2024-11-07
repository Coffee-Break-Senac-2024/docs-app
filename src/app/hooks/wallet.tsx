import { createContext, useCallback, useContext, useState } from "react";
import { walletApi } from "../api/wallet-api";
import { AxiosError } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Alert } from "react-native";

export interface WalletDocumentRequest {
    file: File | string;
    documentName: string;
    walletDocumentType: string;
}

interface Document {
    id: string;
    documentName: string;
    walletDocumentType: string;
    userId: string;
    url: string;
}

interface WalletContextData {
    createDocument: (data: WalletDocumentRequest) => Promise<number | undefined>;
    getDocuments: () => Promise<Document[] | null>;
    downloadDocument: (documentId: string, documentName: string) => Promise<void>;
    documents: Document[] | null;
    error: string | null;
}

const WalletContext = createContext<WalletContextData>({} as WalletContextData);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [documents, setDocuments] = useState<Document[] | null>(null);
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

    const getDocuments = useCallback(async (): Promise<Document[] | null> => {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }

            const response = await walletApi.get('/api/user/wallet', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Resposta da API:", JSON.stringify(response.data, null, 2));

            setDocuments(response.data.wallet);
            setError(null);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message || 'Erro ao buscar documentos');
            } else {
                setError('Erro desconhecido ao buscar documentos');
            }
            setDocuments(null);
            return null;
        }
    }, []);

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


    const downloadDocument = useCallback(async (documentId: string, documentName: string) => {
        try {
            const downloadUrl = `http://ec2-52-201-168-41.compute-1.amazonaws.com:8082/api/user/wallet/download/${documentId}`;
            const fileUri = `${FileSystem.documentDirectory}${documentName}`;

            const token = await getToken();
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }

            const response = await fetch(downloadUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ao baixar o documento: ${response.statusText}`);
            }

            const blob = await response.blob();
            const fileReader = new FileReader();

            fileReader.onloadend = async () => {
                const base64data = fileReader.result as string;

                await FileSystem.writeAsStringAsync(fileUri, base64data, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                console.log(`Download concluído. Arquivo salvo em: ${fileUri}`);
                Alert.alert("Download concluído", `Arquivo salvo em: ${fileUri}`);
            };

            fileReader.readAsDataURL(blob);
        } catch (error) {
            console.error("Erro ao baixar o arquivo:", error);
            setError('Erro ao baixar o documento');
        }
    }, []);


    return (
        <WalletContext.Provider value={{ createDocument, getDocuments, downloadDocument, documents, error }}>
            {children}
        </WalletContext.Provider>
    );
};

function useWallet(): WalletContextData {
    const context = useContext(WalletContext);

    if (!context) {
        throw new Error('useWallet deve ser usado dentro de um WalletProvider');
    }

    return context;
}

export { WalletProvider, useWallet };
