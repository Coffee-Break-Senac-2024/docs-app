import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View, Modal, Button, Text, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import { useWallet } from '../../hooks/wallet';
import { Container, FolderItem, FolderName, ErrorText } from './styles';

const FolderList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { getValidatedDocuments } = useWallet();
  const [validatedDocuments, setValidatedDocuments] = useState<ValidatedDocument[]>([]);

  useEffect(() => {
    const fetchValidatedDocuments = async () => {
      try {
        setLoading(true);
        const documents = await getValidatedDocuments();
        setValidatedDocuments(documents);
      } catch (err) {
        setError("Erro ao carregar documentos validados.");
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
    <FolderItem onPress={() => handleDocumentClick(item)}>
      <Icon name="checkmark-circle-outline" size={24} color="#28a745" />
      <FolderName>{item.documentName}</FolderName>
      <Text style={{ fontSize: 12, color: item.message.includes('válida') ? '#28a745' : '#dc3545' }}>
        {item.message}
      </Text>
    </FolderItem>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <ErrorText>{error}</ErrorText>;
  }

  if (validatedDocuments.length === 0) {
    return (
      <Container style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
        <Text style={{ fontSize: 16 }}>Nenhum documento validado encontrado.</Text>
      </Container>
    );
  }

  return (
    <Container>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Documentos Validados</Text>
      <FlatList
        data={validatedDocuments}
        renderItem={renderValidatedItem}
        keyExtractor={(item) => item.id}
        numColumns={1}
        showsVerticalScrollIndicator={false}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View style={{ width: 300, padding: 20, backgroundColor: "white", borderRadius: 10 }}>
            {selectedDocument ? (
              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <QRCode
                  value={`${selectedDocument.documentName}\n${selectedDocument.message}`}
                  size={150}
                  color="black"
                  backgroundColor="white"
                />
                <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "bold" }}>
                  {selectedDocument.documentName}
                </Text>
                <Text style={{ marginTop: 5, color: selectedDocument.message.includes("válida") ? "#28a745" : "#dc3545" }}>
                  {selectedDocument.message}
                </Text>
              </View>
            ) : (
              <Text>Nenhum documento selecionado</Text>
            )}
            <Button title="Fechar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </Container>
  );
};


export default FolderList;
