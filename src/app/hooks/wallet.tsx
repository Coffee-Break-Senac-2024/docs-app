import React, { createContext, useCallback, useContext, useState } from "react";
import { walletApi } from "../api/wallet-api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import forge from "node-forge";
import { Alert } from "react-native";

// Tipos
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

interface ValidatedDocument {
    id: string;
    documentName: string;
    message: string;
}

interface WalletContextData {
    createDocument: (data: WalletDocumentRequest) => Promise<number | undefined>;
    getDocuments: () => Promise<Document[] | null>;
    validateDocument: (documentId: string, documentName: string) => Promise<string | null>;
    downloadDocument: (documentId: string, documentName: string) => Promise<void>;
    getValidatedDocuments: () => Promise<ValidatedDocument[]>;
    documents: Document[] | null;
    error: string | null;
}

// Contexto
const WalletContext = createContext<WalletContextData>({} as WalletContextData);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [documents, setDocuments] = useState<Document[] | null>(null);
    const [validatedDocuments, setValidatedDocuments] = useState<ValidatedDocument[]>([]);
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

    const downloadDocument = useCallback(async (documentId: string, documentName: string) => {
        try {
            const downloadUrl = `http://ec2-52-201-168-41.compute-1.amazonaws.com:8082/api/user/wallet/download/${documentId}`;
            const fileUri = `${FileSystem.documentDirectory}${documentName}`;

            const token = await getToken();
            if (!token) throw new Error("Token de autenticação não encontrado");

            const response = await FileSystem.downloadAsync(downloadUrl, fileUri, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status !== 200) throw new Error("Erro ao baixar o documento");

            Alert.alert("Download concluído", `Arquivo salvo em: ${fileUri}`);
        } catch (error) {
            console.error("Erro ao baixar documento:", error);
            setError("Erro ao baixar documento");
        }
    }, []);

    const saveValidatedDocument = async (documentId: string, documentName: string, message: string) => {
        try {
            const storedData = await AsyncStorage.getItem("@validatedDocuments");
            const parsedData = storedData ? JSON.parse(storedData) : [];
            const updatedData = [...parsedData, { id: documentId, documentName, message }];
            await AsyncStorage.setItem("@validatedDocuments", JSON.stringify(updatedData));
            setValidatedDocuments(updatedData);
        } catch (err) {
            console.error("Erro ao salvar documento validado:", err);
        }
    };

    const getValidatedDocuments = async (): Promise<ValidatedDocument[]> => {
        try {
            const storedData = await AsyncStorage.getItem("@validatedDocuments");
            const parsedData = storedData ? JSON.parse(storedData) : [];
            setValidatedDocuments(parsedData);
            return parsedData;
        } catch (err) {
            console.error("Erro ao buscar documentos validados:", err);
            return [];
        }
    };

    const validateDocument = useCallback(async (documentId: string, documentName: string): Promise<string | null> => {
        try {
            const token = await getToken();
            if (!token) throw new Error("Token de autenticação não encontrado");

            const response = await walletApi.get(`/api/user/wallet/${documentId}/verify`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { hashRsa, publicKey } = response.data;

            const signature = forge.util.decode64(hashRsa);
            const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
            const publicKeyObject = forge.pki.publicKeyFromPem(publicKeyPem);

            const md = forge.md.sha256.create();
            md.update(signature, "utf8");

            const isValid = publicKeyObject.verify(md.digest().bytes(), signature);
            const message = isValid ? "Assinatura válida!" : "Assinatura inválida!";

            console.log(message);
            await saveValidatedDocument(documentId, documentName, message);

            return message;
        } catch (err) {
            console.error("Erro ao validar documento:", err);
            setError("Erro ao validar o documento");
            return null;
        }
    }, []);

    return (
        <WalletContext.Provider
            value={{
                createDocument: async () => Promise.resolve(undefined),
                getDocuments,
                validateDocument,
                downloadDocument,
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
