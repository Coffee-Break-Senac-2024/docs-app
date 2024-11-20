import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, Alert } from 'react-native';
import { useWallet } from '../../hooks/wallet';
import Toast from 'react-native-toast-message';

const WalletDisplay: React.FC = () => {
  const { getDocuments, downloadDocument, validateDocument, getValidatedDocuments, documents, error } = useWallet();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getDocuments();
        console.log("Dados carregados:", data);
      } catch (err) {
        console.error("Erro ao buscar documentos:", err);
      }
    };
    fetchDocuments();
  }, [getDocuments]);

  const handleDownload = async (documentId: string, documentName: string) => {
    try {
      await downloadDocument(documentId, documentName);
      Toast.show({
        type: 'success',
        text1: 'Download concluído',
        text2: `O documento "${documentName}" foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao baixar documento:", error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível baixar o documento.',
      });
    }
  };

  const handleValidate = async (documentId: string, documentName: string) => {
    try {
      const validatedDocuments = await getValidatedDocuments();
      const existingDocument = validatedDocuments.find((doc) => doc.id === documentId);

      if (existingDocument) {
        Toast.show({
          type: 'info',
          text1: 'Documento Já Validado',
          text2: `O documento "${documentName}" já foi validado: ${existingDocument.message}`,
        });
        return;
      }

      const validationMessage = await validateDocument(documentId, documentName);
      if (validationMessage) {
        Toast.show({
          type: 'success',
          text1: 'Documento Validado',
          text2: `O documento "${documentName}" foi validado com sucesso.`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro na Validação',
          text2: 'Não foi possível validar o documento.',
        });
      }
    } catch (error) {
      console.error("Erro ao validar documento:", error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Houve um problema ao validar o documento.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Documentos</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : documents ? (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.documentItem}>
              <Text style={styles.documentName}>Nome do Documento: {item.documentName}</Text>
              <Text style={styles.documentType}>Tipo: {item.walletDocumentType}</Text>
              <View style={styles.buttonContainer}>
                <Button
                  title="Baixar"
                  onPress={() => handleDownload(item.id, item.documentName)}
                  color="#004aad"
                />
                <Button
                  title="Validar"
                  onPress={() => handleValidate(item.id, item.documentName)}
                  color="#007BFF"
                />
              </View>
            </View>
          )}
        />
      ) : (
        <ActivityIndicator size="large" color="#004aad" />
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  documentItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  documentName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  documentType: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default WalletDisplay;
