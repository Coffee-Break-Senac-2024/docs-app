import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import { useWallet } from '../../hooks/wallet';

const FolderList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { getValidatedDocuments } = useWallet();
  const [validatedDocuments, setValidatedDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchValidatedDocuments = async () => {
      try {
        setLoading(true);
        const documents = await getValidatedDocuments();
        setValidatedDocuments(documents);
      } catch (err) {
        setError('Erro ao carregar documentos validados.');
      } finally {
        setLoading(false);
      }
    };

    fetchValidatedDocuments();
  }, [getValidatedDocuments]);

  const handleDocumentClick = (document: any) => {
    setSelectedDocument(document);
    setModalVisible(true);
  };

  const renderValidatedItem = ({ item }: { item: { id: string; documentName: string; message: string } }) => (
    <TouchableOpacity style={styles.documentItem} onPress={() => handleDocumentClick(item)}>
      <View style={styles.iconContainer}>
        <Icon name="document-text-outline" size={24} color="#004aad" />
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentName}>{item.documentName}</Text>
        <Text
          style={[
            styles.documentStatus,
            { color: item.message.includes('válida') ? '#28a745' : '#dc3545' },
          ]}
        >
          {item.message}
        </Text>
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
        <Text style={styles.emptyText}>Nenhum documento validado encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Documentos Validados</Text>
      <FlatList
        data={validatedDocuments}
        renderItem={renderValidatedItem}
        keyExtractor={(item) => item.id}
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
                <QRCode
                  value={`Documento: ${selectedDocument.documentName}\nStatus: ${selectedDocument.message}`}
                  size={150}
                  color="black"
                  backgroundColor="white"
                />
              </View>
            ) : (
              <Text style={styles.emptyText}>Nenhum documento selecionado</Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
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
