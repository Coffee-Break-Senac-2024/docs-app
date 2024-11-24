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
  const { getDocuments, downloadAndSaveDocument } = useWallet();
  const [loading, setLoading] = useState(true);
  const [localDocuments, setLocalDocuments] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingButtons, setLoadingButtons] = useState<{ [key: string]: boolean }>({});

  // Função para buscar documentos na API
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
    } catch (error) {
      setFetchError('Erro ao buscar documentos. Por favor, tente novamente.');
      console.error('Erro ao buscar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Função para exibir mensagens de notificação
  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
    });
  };

  // Função para baixar documentos
  const handleDownload = async (documentId: string, documentName: string) => {
    setLoadingButtons((prev) => ({ ...prev, [documentId]: true }));
    try {
      const downloadMessage = await downloadAndSaveDocument(documentId, documentName);

      if (downloadMessage) {
        showToast('success', 'Download Concluído', `O documento "${documentName}" foi baixado com sucesso.`);
      } else {
        showToast('error', 'Erro', 'Não foi possível baixar o documento.');
      }
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      showToast('error', 'Erro', 'Houve um problema ao baixar o documento.');
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  // Renderização da tela com base no estado
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

  // Renderização da lista de documentos
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Documentos</Text>
      <FlatList
        data={localDocuments}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.documentItem}>
            <Text style={styles.documentName}>Nome: {item.documentName}</Text>
            <Text style={styles.documentType}>Tipo: {item.walletDocumentType}</Text>
            <View style={styles.buttonContainer}>
              {loadingButtons[item.id] ? (
                <ActivityIndicator size="small" color="#007BFF" />
              ) : (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => handleDownload(item.id, item.documentName)}
                >
                  <Text style={styles.downloadButtonText}>Baixar</Text>
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

// Estilização
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
    color: '#004aad',
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
    borderLeftWidth: 4,
    borderLeftColor: '#004aad',
  },
  documentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  documentType: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  downloadButton: {
    flex: 1,
    paddingVertical: 10,
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
