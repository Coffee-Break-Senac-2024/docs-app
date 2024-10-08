import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View, Modal, Button, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg'; 
import { Container, FolderItem, FolderName, ErrorText } from './styles';

const FolderList: React.FC = () => {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null); 
  const [modalVisible, setModalVisible] = useState(false); 

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = [
          { id: '1', name: 'Documentos' },
          { id: '2', name: 'Imagens' },
          { id: '3', name: 'Escola' },
          { id: '4', name: 'Saúde' },
          { id: '5', name: 'Boletos' },
          { id: '6', name: 'Apostas'},
        ];
        // Simulando um atraso como se fosse uma requisição
        setTimeout(() => {
          setFolders(data);
          setLoading(false);
        }, 1000);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  const handleFolderClick = (folder: any) => {
    setSelectedFolder(folder);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: { name: string } }) => (
    <FolderItem onPress={() => handleFolderClick(item)}>
      <Icon name="folder" size={24} color="#004aad" />
      <FolderName>{item.name}</FolderName>
    </FolderItem>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <ErrorText>{error}</ErrorText>;
  }

  return (
    <Container>
      <FlatList
        data={folders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id} 
        numColumns={3} 
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal para exibir o QR Code */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
            {selectedFolder && (
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <QRCode
                  value={selectedFolder.name} // O valor do QR Code é o nome da pasta
                  size={150}
                  color="black"
                  backgroundColor="white"
                />
              </View>
            )}
            <Button title="Fechar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </Container>
  );
};

export default FolderList;
