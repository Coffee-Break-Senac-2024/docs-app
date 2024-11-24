import React, { createContext, useCallback, useContext, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { walletApi } from "../api/wallet-api";
import * as FileSystem from "expo-file-system";
import { AxiosError } from "axios";

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

const WalletContext = createContext<WalletContextData>({} as WalletContextData);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [documents, setDocuments] = useState<Document[] | null>(null);
    const [error, setError] = useState<string | null>(null);


    const getToken = async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem("@docs:token");
        } catch (error) {
            console.error("Erro ao obter o token:", error);
            return null;
        }
    };

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

    const getValidatedDocuments = async (): Promise<ValidatedDocument[]> => {
        try {
            const storedData = await AsyncStorage.getItem("@validatedDocuments");
            return storedData ? JSON.parse(storedData) : [];
        } catch (error) {
            console.error("Erro ao buscar documentos validados:", error);
            return [];
        }
    };

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

    const downloadAndSaveDocument = async (documentId: string, documentName: string): Promise<string | null> => {
        try {

            const existingDocuments = await AsyncStorage.getItem('@validatedDocuments');
            const parsedDocuments: ValidatedDocument[] = existingDocuments ? JSON.parse(existingDocuments) : [];
            const isAlreadyDownloaded = parsedDocuments.some(doc => doc.id === documentId);

            if (isAlreadyDownloaded) {
                return `O documento "${documentName}" já foi baixado anteriormente.`;
            }

            const token = await getToken();
            if (!token) throw new Error("Token de autenticação não encontrado");

            const downloadUrl = `http://ec2-52-201-168-41.compute-1.amazonaws.com:8082/api/user/wallet/download/${documentId}`;
            
            const response = await walletApi.get(downloadUrl, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "arraybuffer",
            });

            const byteArray = new Uint8Array(response.data);
            let imageUri: string | null = null;
            let base64Image: string | null = null;

            if (Platform.OS === "web") {
                base64Image = bytesToBase64(byteArray);
                await saveImageForWeb(documentId, documentName, base64Image);
            } else {
                base64Image = bytesToBase64(byteArray);
                imageUri = await saveImageToStorage(documentId, documentName, base64Image);
            }

            const validationResponse = await walletApi.get(`/api/user/wallet/${documentId}/verify`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { hash, hashRsa, publicKey } = validationResponse.data;

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

            return `Documento ${documentName} baixado e salvo com sucesso!`;
        } catch (error) {
            console.error("Erro ao processar documento:", error);
            setError("Erro ao processar o documento");
            return null;
        }
    };

    const bytesToBase64 = (bytes: Uint8Array): string => {
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

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
