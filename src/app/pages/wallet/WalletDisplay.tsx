import React, { useEffect, useState } from 'react';
import withAutoReload from '../../components/withAutoReload';
import {
  FlatList,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useWallet } from '../../hooks/wallet';
import Toast from 'react-native-toast-message';

const WalletDisplay: React.FC = () => {
  const { getDocuments, downloadAndValidateDocument, documents, error } = useWallet();
  const [loading, setLoading] = useState(true);
  const [localDocuments, setLocalDocuments] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingButtons, setLoadingButtons] = useState<{ [key: string]: boolean }>({});

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await getDocuments();
      if (data) {
        setLocalDocuments(data);
      } else {
        setFetchError('Não foi possível buscar os documentos.');
      }
    } catch (err) {
      setFetchError('Erro ao buscar documentos. Por favor, tente novamente.');
      console.error('Erro ao buscar documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDownloadAndValidate = async (documentId: string, documentName: string) => {
    setLoadingButtons((prev) => ({ ...prev, [documentId]: true }));
    try {
      const validationMessage = await downloadAndValidateDocument(documentId, documentName);

      if (validationMessage) {
        Toast.show({
          type: 'success',
          text1: 'Operação Concluída',
          text2: `O documento "${documentName}" foi baixado e validado: ${validationMessage}`,
        });
        // Atualiza a lista de documentos locais após validação
        fetchDocuments();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível baixar ou validar o documento.',
        });
      }
    } catch (error) {
      console.error('Erro ao baixar e validar documento:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Houve um problema ao processar o documento.',
      });
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#004aad" />
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{fetchError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDocuments}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (localDocuments.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Nenhum documento encontrado.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDocuments}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Documentos</Text>
      <FlatList
        data={localDocuments}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.documentItem}>
            <Text style={styles.documentName}>Nome do Documento: {item.documentName}</Text>
            <Text style={styles.documentType}>Tipo: {item.walletDocumentType}</Text>
            <View style={styles.buttonContainer}>
              {loadingButtons[item.id] ? (
                <ActivityIndicator size="small" color="#007BFF" />
              ) : (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => handleDownloadAndValidate(item.id, item.documentName)}
                >
                  <Text style={styles.downloadButtonText}>Baixar e Validar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
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
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  downloadButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default withAutoReload(WalletDisplay);
