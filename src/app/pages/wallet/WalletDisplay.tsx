import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, Alert } from 'react-native';
import { useWallet } from '../../hooks/wallet';
import Toast from 'react-native-toast-message';

const WalletDisplay: React.FC = () => {
  const { getDocuments, downloadDocument, documents, error } = useWallet();

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
              <Button
                title="Baixar"
                onPress={() => handleDownload(item.id, item.documentName)}
                color="#004aad"
              />
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
});

export default WalletDisplay;
