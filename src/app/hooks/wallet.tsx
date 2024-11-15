import { createContext, useCallback, useContext, useState } from "react";
import { walletApi } from "../api/wallet-api";
import { AxiosError } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Alert } from "react-native";

// Define o tipo para arquivo com `uri`, `name` e `type`
interface FileWithUri {
    uri: string;
    name: string;
    type: string;
}

export interface WalletDocumentRequest {
    file: FileWithUri;
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
                setLoading(true);
                const token = await getToken();
                if (!token) {
                    throw new Error('Token de autenticação não encontrado');
                }

                // Transformar o `uri` em um `Blob` usando `fetch`
                const response = await fetch(file.uri);
                const blob = await response.blob();

                const formData = new FormData();
                formData.append('file', blob, file.name); // Adiciona o arquivo como `Blob` com o nome do arquivo
                formData.append('documentName', documentName);
                formData.append('walletDocumentType', walletDocumentType);

                const apiResponse = await walletApi.post('/api/user/wallet/create', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (apiResponse.status === 201) {
                    setError(null);
                    return apiResponse.status;
                } else {
                    setError('Erro ao cadastrar documento');
                    return apiResponse.status;
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
            const documentsDir = `${FileSystem.documentDirectory}Documents/`; // Diretório da pasta
            const fileUri = `${documentsDir}${documentName}`; // Caminho completo do arquivo
    
            // Verifica se a pasta Documents existe, caso contrário, cria
            const dirInfo = await FileSystem.getInfoAsync(documentsDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
                console.log('Pasta "Documents" criada com sucesso.');
            }
    
            const downloadUrl = `http://ec2-52-201-168-41.compute-1.amazonaws.com:8082/api/user/wallet/download/${documentId}`;
            const token = await getToken();
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }
    
           
            const downloadRes = await FileSystem.downloadAsync(downloadUrl, fileUri, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (downloadRes.status !== 200) {
                throw new Error(`Erro ao baixar o arquivo: ${downloadRes.status}`);
            }
    
            console.log(`Download concluído. Arquivo salvo em: ${fileUri}`);
            Alert.alert("Download concluído", `Arquivo salvo em: ${fileUri}`);
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
