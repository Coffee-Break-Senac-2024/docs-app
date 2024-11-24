import React, { createContext, useCallback, useContext, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { walletApi } from "../api/wallet-api";
import forge from "node-forge";
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
    validateOfflineDocument: (documentId: string) => Promise<string | null>;
    getValidatedDocuments: () => Promise<ValidatedDocument[]>;
    documents: Document[] | null;
    error: string | null;
}

// Contexto
const WalletContext = createContext<WalletContextData>({} as WalletContextData);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [documents, setDocuments] = useState<Document[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Token
    const getToken = async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem("@docs:token");
        } catch (error) {
            console.error("Erro ao obter o token:", error);
            return null;
        }
    };

    // Documentos
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

    // Documentos validados
    const getValidatedDocuments = async (): Promise<ValidatedDocument[]> => {
        try {
            const storedData = await AsyncStorage.getItem("@validatedDocuments");
            return storedData ? JSON.parse(storedData) : [];
        } catch (error) {
            console.error("Erro ao buscar documentos validados:", error);
            return [];
        }
    };

    // Documentos inválidos
    const getInvalidDocuments = async (): Promise<any[]> => {
        try {
            const storedData = await AsyncStorage.getItem("@invalidDocuments");
            return storedData ? JSON.parse(storedData) : [];
        } catch (error) {
            console.error("Erro ao buscar documentos inválidos:", error);
            return [];
        }
    };

    // Salvar documento inválido
    const saveInvalidDocument = async (documentData: ValidatedDocument) => {
        try {
            const storedData = await AsyncStorage.getItem("@invalidDocuments");
            const parsedData = storedData ? JSON.parse(storedData) : [];
            const updatedData = [...parsedData.filter((doc: any) => doc.id !== documentData.id), documentData];

            await AsyncStorage.setItem("@invalidDocuments", JSON.stringify(updatedData));
            console.log(`Documento ${documentData.documentName} salvo como inválido para validação posterior.`);
        } catch (error) {
            console.error("Erro ao salvar documento inválido:", error);
        }
    };

    // Salvar documento validado
    const saveValidatedDocument = async (
        documentId: string,
        documentName: string,
        message: string,
        hash: string,
        hashRsa: string,
        publicKey: string,
        imageUri?: string,
        base64Image?: string
    ) => {
        try {
            const newDocument: ValidatedDocument = { id: documentId, documentName, message, hash, hashRsa, publicKey, imageUri, base64Image };
            const storedData = await AsyncStorage.getItem("@validatedDocuments");
            const parsedData = storedData ? JSON.parse(storedData) : [];
            const updatedData = [...parsedData.filter((doc: any) => doc.id !== documentId), newDocument];

            await AsyncStorage.setItem("@validatedDocuments", JSON.stringify(updatedData));
            console.log(`Documento ${documentName} salvo como validado.`);
        } catch (error) {
            console.error("Erro ao salvar documento validado:", error);
        }
    };

    // Download e salvamento
    const downloadAndSaveDocument = async (documentId: string, documentName: string): Promise<string | null> => {
        try {
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

            // Dados de validação
            const validationResponse = await walletApi.get(`/api/user/wallet/${documentId}/verify`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { hash, hashRsa, publicKey } = validationResponse.data;

            // Salvar como inválido
            const invalidDocumentData: ValidatedDocument = {
                id: documentId,
                documentName,
                message: "Documento inválido",
                hash,
                hashRsa,
                publicKey,
                imageUri,
                base64Image,
            };

            await saveInvalidDocument(invalidDocumentData);

            return "Documento baixado e salvo com sucesso para validação posterior";
        } catch (error) {
            console.error("Erro ao processar documento:", error);
            setError("Erro ao processar o documento");
            return null;
        }
    };

    // Validação offline
    const validateOfflineDocument = async (documentId: string): Promise<string | null> => {
        try {
            const invalidDocuments = await getInvalidDocuments();
            const documentData = invalidDocuments.find((doc) => doc.id === documentId);

            if (!documentData) {
                throw new Error("Documento ou dados de validação não encontrados no armazenamento de inválidos.");
            }

            const { hash, hashRsa, publicKey, documentName, imageUri, base64Image } = documentData;

            const publicKeyBytes = forge.util.decode64(publicKey);
            const publicKeyAsn1 = forge.asn1.fromDer(forge.util.createBuffer(publicKeyBytes));
            const publicKeyObject = forge.pki.publicKeyFromAsn1(publicKeyAsn1);
            const signatureBytes = forge.util.decode64(hashRsa);
            const md = forge.md.sha256.create();
            md.update(hash);

            const isValid = publicKeyObject.verify(md.digest().bytes(), signatureBytes);
            const message = isValid ? "Assinatura válida!" : "Assinatura inválida!";

            if (isValid) {
                await saveValidatedDocument(
                    documentId,
                    documentName,
                    message,
                    hash,
                    hashRsa,
                    publicKey,
                    imageUri,
                    base64Image
                );

                const updatedInvalidDocuments = invalidDocuments.filter((doc) => doc.id !== documentId);
                await AsyncStorage.setItem("@invalidDocuments", JSON.stringify(updatedInvalidDocuments));
            }

            return message;
        } catch (error) {
            console.error("Erro ao validar documento offline:", error);
            setError("Erro ao validar documento offline");
            return null;
        }
    };

    // Conversão para Base64
    const bytesToBase64 = (bytes: Uint8Array): string => {
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    // Salvar imagem no armazenamento
    const saveImageToStorage = async (
        documentId: string,
        documentName: string,
        base64Image: string
    ): Promise<string> => {
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
            })

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
                validateOfflineDocument,
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
