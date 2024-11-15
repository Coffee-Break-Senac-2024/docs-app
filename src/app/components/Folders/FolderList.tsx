import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View, Modal, Button, Image, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg'; 
import { useNavigation } from '@react-navigation/native'; // Para navegação
import { Container, FolderItem, FolderName, ErrorText } from './styles';

const FolderList: React.FC = () => {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null); 
  const [modalVisible, setModalVisible] = useState(false); 
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        const savedFolders = await AsyncStorage.getItem('@folders'); 
        if (savedFolders) {
          setFolders(JSON.parse(savedFolders)); 
        } else {
          setFolders([]); 
        }
      } catch (err: any) {
        setError('Erro ao carregar as pastas.');
        console.error('Erro ao acessar AsyncStorage:', err);
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

  const renderItem = ({ item }: { item: { name: string; image: string } }) => (
    <FolderItem onPress={() => handleFolderClick(item)}>
      <Image
        source={{ uri: item.image }} 
        style={{ width: 50, height: 50, marginBottom: 10, borderRadius: 5 }}
        resizeMode="cover"
      />
      <FolderName>{item.name}</FolderName>
    </FolderItem>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <ErrorText>{error}</ErrorText>;
  }

  if (folders.length === 0) {
    return (
      <Container style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Text style={{ fontSize: 16, marginBottom: 20 }}>Nenhum documento encontrado.</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('DocumentCreate')}
          style={{
            backgroundColor: '#004aad',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Cadastrar Documento</Text>
        </TouchableOpacity>
      </Container>
    );
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
                  value={selectedFolder.name} 
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
