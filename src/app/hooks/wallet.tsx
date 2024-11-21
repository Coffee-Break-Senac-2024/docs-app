import React, { createContext, useCallback, useContext, useState } from "react";
import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { walletApi } from "../api/wallet-api";
import forge from "node-forge";
import * as FileSystem from "expo-file-system";
import { AxiosError } from "axios";

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

  const getValidatedDocuments = async (): Promise<ValidatedDocument[]> => {
    if (Platform.OS === "web") {
      return validatedDocuments;
    }
    try {
      const storedData = await AsyncStorage.getItem("@validatedDocuments");
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("Erro ao buscar documentos validados:", error);
      return [];
    }
  };

  const saveValidatedDocument = async (documentId: string, documentName: string, message: string) => {
    const newDocument = { id: documentId, documentName, message };

    if (Platform.OS === "web") {
      setValidatedDocuments((prev) => [...prev, newDocument]);
    } else {
      try {
        const storedData = await AsyncStorage.getItem("@validatedDocuments");
        const parsedData = storedData ? JSON.parse(storedData) : [];
        const updatedData = [...parsedData, newDocument];
        await AsyncStorage.setItem("@validatedDocuments", JSON.stringify(updatedData));
      } catch (error) {
        console.error("Erro ao salvar documento validado:", error);
      }
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

  const validateDocument = async (documentId: string, documentName: string): Promise<string | null> => {
    try {
      const existingDocument = validatedDocuments.find((doc) => doc.id === documentId);
      if (existingDocument) {
        console.log("Documento já validado:", existingDocument);
        return existingDocument.message;
      }

      const token = await getToken();
      if (!token) throw new Error("Token de autenticação não encontrado");

      const response = await walletApi.get(`/api/user/wallet/${documentId}/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { hash, hashRsa, publicKey } = response.data;

      const publicKeyBytes = forge.util.decode64(publicKey);
      const publicKeyAsn1 = forge.asn1.fromDer(forge.util.createBuffer(publicKeyBytes));
      const publicKeyObject = forge.pki.publicKeyFromAsn1(publicKeyAsn1);
      const signatureBytes = forge.util.decode64(hashRsa);
      const md = forge.md.sha256.create();
      md.update(hash);

      const isValid = publicKeyObject.verify(md.digest().bytes(), signatureBytes);
      const message = isValid ? "Assinatura válida!" : "Assinatura inválida!";

      await saveValidatedDocument(documentId, documentName, message);
      return message;
    } catch (err) {
      console.error("Erro ao validar documento:", err);
      setError("Erro ao validar o documento");
      return null;
    }
  };

  const createDocument = useCallback(
    async ({ file, documentName, walletDocumentType }: WalletDocumentRequest): Promise<number | undefined> => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Token de autenticação não encontrado");
        }

        const response = await fetch(file.uri);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append("file", blob, file.name);
        formData.append("documentName", documentName);
        formData.append("walletDocumentType", walletDocumentType);

        const apiResponse = await walletApi.post("/api/user/wallet/create", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (apiResponse.status === 201) {
          setError(null);
          return apiResponse.status;
        } else {
          setError("Erro ao cadastrar documento");
          return apiResponse.status;
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(error.response?.data.message || "Erro ao cadastrar documento");
          return error.response?.status || 500;
        }
        setError("Erro desconhecido ao cadastrar documento");
        return 500;
      }
    },
    []
  );

  return (
    <WalletContext.Provider
      value={{
        createDocument,
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
