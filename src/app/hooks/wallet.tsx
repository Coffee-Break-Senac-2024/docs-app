import React, { createContext, useCallback, useContext, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { walletApi } from "../api/wallet-api";
import * as FileSystem from "expo-file-system";
import { AxiosError } from "axios";

// Tipos
interface FileWithUri {
    uri: string | undefined;
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

interface ValidatedDocument {
    id: string;
    documentName: string;
    message: string;
    hash: string;
    hashRsa: string;
    publicKey: string;
    imageUri?: string | null;
    base64Image?: string;
}

interface WalletContextData {
    createDocument: (data: WalletDocumentRequest) => Promise<number | undefined>;
    getDocuments: () => Promise<Document[] | null>;
    downloadAndSaveDocument: (documentId: string, documentName: string) => Promise<string | null>;
    getValidatedDocuments: () => Promise<ValidatedDocument[]>;
    documents: Document[] | null;
    error: string | null;
}

// Contexto
const WalletContext = createContext<WalletContextData>({} as WalletContextData);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [documents, setDocuments] = useState<Document[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Recupera o token
    const getToken = async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem("@docs:token");
        } catch (error) {
            console.error("Erro ao obter o token:", error);
            return null;
        }
    };

    // Busca os documentos do usuário
    const getDocuments = useCallback(async (): Promise<Document[] | null> => {
        try {
            const token = await getToken();
            if (!token) throw new Error("Token de autenticação não encontrado");

            const response = await walletApi.get("/api/user/wallet", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setDocuments(response.data.wallet);
            return response.data.wallet;
        } catch (error) {
            console.error("Erro ao buscar documentos:", error);
            setError("Erro ao buscar documentos");
            return null;
        }
    }, []);

    // Busca documentos salvos localmente
    const getValidatedDocuments = async (): Promise<ValidatedDocument[]> => {
        try {
            const storedData = await AsyncStorage.getItem("@validatedDocuments");
            return storedData ? JSON.parse(storedData) : [];
        } catch (error) {
            console.error("Erro ao buscar documentos validados:", error);
            return [];
        }
    };

    // Salva documento validado
    const saveDocument = async (document: ValidatedDocument) => {
        try {
            const storedData = await AsyncStorage.getItem("@validatedDocuments");
            const parsedData = storedData ? JSON.parse(storedData) : [];
            const updatedData = [...parsedData.filter((doc: any) => doc.id !== document.id), document];

            await AsyncStorage.setItem("@validatedDocuments", JSON.stringify(updatedData));
            console.log(`Documento ${document.documentName} salvo com sucesso.`);
        } catch (error) {
            console.error("Erro ao salvar documento validado:", error);
        }
    };

    // Download e salvamento do documento
    const downloadAndSaveDocument = async (documentId: string, documentName: string): Promise<string | null> => {
        try {
            const token = await getToken();
            if (!token) throw new Error("Token de autenticação não encontrado");

            const downloadUrl = `http://ec2-52-201-168-41.compute-1.amazonaws.com:8082/api/user/wallet/download/${documentId}`;
            
            // Download do documento
            const response = await walletApi.get(downloadUrl, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "arraybuffer",
            });

            const byteArray = new Uint8Array(response.data);
            let imageUri: string | null = null;
            let base64Image: string | null = null;

            // Armazena a imagem dependendo da plataforma
            if (Platform.OS === "web") {
                base64Image = bytesToBase64(byteArray);
                await saveImageForWeb(documentId, documentName, base64Image);
            } else {
                base64Image = bytesToBase64(byteArray);
                imageUri = await saveImageToStorage(documentId, documentName, base64Image);
            }

            // Busca dados de validação
            const validationResponse = await walletApi.get(`/api/user/wallet/${documentId}/verify`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { hash, hashRsa, publicKey } = validationResponse.data;

            // Salva os dados com as informações obtidas
            const savedDocument: ValidatedDocument = {
                id: documentId,
                documentName,
                message: "Documento salvo com dados de validação",
                hash,
                hashRsa,
                publicKey,
                imageUri,
                base64Image,
            };

            await saveDocument(savedDocument);

            return `Documento ${documentName} baixado e salvo com sucesso com dados de validação.`;
        } catch (error) {
            console.error("Erro ao processar documento:", error);
            setError("Erro ao processar o documento");
            return null;
        }
    };

    // Converte bytes para Base64
    const bytesToBase64 = (bytes: Uint8Array): string => {
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    // Salva imagem no dispositivo
    const saveImageToStorage = async (documentId: string, documentName: string, base64Image: string): Promise<string> => {
        const fileUri = `${FileSystem.documentDirectory}${documentId}_${documentName}.png`;
        try {
            await FileSystem.writeAsStringAsync(fileUri, base64Image, { encoding: FileSystem.EncodingType.Base64 });
            return fileUri;
        } catch (error) {
            console.error("Erro ao salvar a imagem:", error);
            throw new Error("Erro ao salvar a imagem no armazenamento.");
        }
    };

    // Salva imagem no armazenamento web
    const saveImageForWeb = async (documentId: string, documentName: string, base64Image: string) => {
        const storageKey = "@webImages";
        try {
            const storedData = await AsyncStorage.getItem(storageKey);
            const images = storedData ? JSON.parse(storedData) : [];
            const updatedImages = [...images.filter((img: any) => img.id !== documentId), { id: documentId, documentName, base64Image }];
            await AsyncStorage.setItem(storageKey, JSON.stringify(updatedImages));
        } catch (error) {
            console.error("Erro ao salvar imagem no ambiente web:", error);
        }
    };

    // Cria um documento
    const createDocument = useCallback(async (data: WalletDocumentRequest): Promise<number | undefined> => {
        const formData = new FormData();

        const file = JSON.parse(JSON.stringify({
            name: data.file.name,
            uri: data.file.uri,
            type: data.file.type
        }));
        
        formData.append('file', file);
        formData.append('documentName', data.documentName);
        formData.append('walletDocumentType', data.walletDocumentType);

        try {
            const token = await getToken();
            if (!token) throw new Error("Token de autenticação não encontrado");

            const response = await walletApi.post(`/api/user/wallet/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                }
            });

            console.log(response, 'response');
            return response.status;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log('Erro ao cadastrar documento:', error);
                return error.response?.status;
            }
        }
    }, []);

    return (
        <WalletContext.Provider
            value={{
                createDocument,
                getDocuments,
                downloadAndSaveDocument,
                getValidatedDocuments,
                documents,
                error,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

function useWallet(): WalletContextData {
    const context = useContext(WalletContext);
    if (!context) throw new Error("useWallet deve ser usado dentro de um WalletProvider");
    return context;
}

export { WalletProvider, useWallet };
