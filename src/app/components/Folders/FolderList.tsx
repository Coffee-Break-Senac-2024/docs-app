import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ActivityIndicator,
  View,
  Modal,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';

const FolderList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'qrcode' | 'document'>('qrcode');

  const [validatedDocuments, setValidatedDocuments] = useState<any[]>([]);

  const fetchValidatedDocuments = async () => {
    try {
      setLoading(true);
      const storedData = await AsyncStorage.getItem('@validatedDocuments');
      const documents = storedData ? JSON.parse(storedData) : [];
      setValidatedDocuments(documents);
    } catch (err) {
      console.error('Erro ao carregar documentos validados:', err);
      setError('Erro ao carregar documentos validados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidatedDocuments();
  }, []);

  const handleDocumentClick = (document: any) => {
    setSelectedDocument(document);
    setViewMode('qrcode');
    setModalVisible(true);
  };

  const getFormattedUri = (uri: string): string => {
    return uri.startsWith('file://') ? uri : `file://${uri}`;
  };

  const renderValidatedItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.documentItem}
      onPress={() => handleDocumentClick(item)}
    >
      <View style={styles.iconContainer}>
        <Icon name="document-text-outline" size={24} color="#004aad" />
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentName}>{item.documentName}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#004aad" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (validatedDocuments.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Nenhum documento baixado!.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meus Documentos</Text>
      <FlatList
        data={validatedDocuments}
        renderItem={renderValidatedItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedDocument ? (
              <View style={styles.modalBody}>
                {viewMode === 'qrcode' ? (
                  <QRCode
                    value={JSON.stringify({
                      id: selectedDocument.id,
                      documentName: selectedDocument.documentName,
                      hash: selectedDocument.hash,
                      hashRsa: selectedDocument.hashRsa,
                      publicKey: selectedDocument.publicKey,
                      message: selectedDocument.message,
                    })}
                    size={150}
                    color="black"
                    backgroundColor="white"
                    onError={(err) => {
                      console.error('Erro ao renderizar QR Code:', err);
                      setModalVisible(false);
                    }}
                  />
                ) : selectedDocument.imageUri || selectedDocument.base64Image ? (
                  <Image
                    source={
                      Platform.OS === 'web'
                        ? { uri: `data:image/png;base64,${selectedDocument.base64Image}` }
                        : { uri: getFormattedUri(selectedDocument.imageUri) }
                    }
                    style={styles.imagePreview}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.emptyText}>Imagem não disponível</Text>
                )}
                <Text style={styles.modalDocumentName}>{selectedDocument.documentName}</Text>
                <Text style={styles.modalDocumentStatus}>{selectedDocument.message}</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      viewMode === 'qrcode' && styles.activeButton,
                    ]}
                    onPress={() => setViewMode('qrcode')}
                  >
                    <Text style={styles.switchButtonText}>Exibir QR Code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      viewMode === 'document' && styles.activeButton,
                    ]}
                    onPress={() => setViewMode('document')}
                  >
                    <Text style={styles.switchButtonText}>Exibir Documento</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>Nenhum documento selecionado</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#004aad',
  },
  list: {
    paddingBottom: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  iconContainer: {
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  documentStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBody: {
    alignItems: 'center',
  },
  modalDocumentName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  modalDocumentStatus: {
    marginTop: 5,
    fontSize: 16,
    textAlign: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 10,
  },
  switchButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#004aad',
  },
  switchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#004aad',
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FolderList;
