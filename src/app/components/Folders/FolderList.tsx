import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View, Modal, Button, Text, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import { useWallet } from '../../hooks/wallet';
import { Container, FolderItem, FolderName, ErrorText } from './styles';

const FolderList: React.FC = () => {
  const [folders, setFolders] = useState<any[]>([]);
  const [validatedDocuments, setValidatedDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { getValidatedDocuments } = useWallet();
  const documentsDir = `${FileSystem.documentDirectory}Documents/`;

  useEffect(() => {
    const fetchFoldersAndValidatedDocuments = async () => {
      try {
        setLoading(true);

        // Verifica e carrega arquivos locais na pasta "Documents"
        const dirInfo = await FileSystem.getInfoAsync(documentsDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
        }
        const files = await FileSystem.readDirectoryAsync(documentsDir);
        const filesWithPaths = files.map((fileName) => ({
          id: fileName,
          name: fileName,
          path: `${documentsDir}${fileName}`,
          isImage: /\.(jpg|jpeg|png|gif)$/i.test(fileName),
        }));

        // Recupera os documentos validados salvos no AsyncStorage
        const validatedDocs = await getValidatedDocuments();

        setFolders(filesWithPaths);
        setValidatedDocuments(validatedDocs);
      } catch (err: any) {
        setError('Erro ao carregar os arquivos ou documentos validados.');
        console.error('Erro ao acessar pastas ou documentos validados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoldersAndValidatedDocuments();
  }, [getValidatedDocuments]);

  const handleFolderClick = (folder: any) => {
    setSelectedFolder(folder);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: { name: string; path: string; isImage: boolean } }) => (
    <FolderItem onPress={() => handleFolderClick(item)}>
      {item.isImage ? (
        <Image
          source={{ uri: item.path }}
          style={{ width: 50, height: 50, marginBottom: 10, borderRadius: 5 }}
          resizeMode="cover"
        />
      ) : (
        <Icon name="document-text-outline" size={24} color="#004aad" />
      )}
      <FolderName>{item.name}</FolderName>
    </FolderItem>
  );

  const renderValidatedItem = ({ item }: { item: { id: string; documentName: string; message: string } }) => (
    <FolderItem>
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

  if (folders.length === 0 && validatedDocuments.length === 0) {
    return (
      <Container style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Text style={{ fontSize: 16 }}>Nenhum documento encontrado.</Text>
      </Container>
    );
  }

  return (
    <Container>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Arquivos Locais</Text>
      <FlatList
        data={folders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Documentos Validados</Text>
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
            {selectedFolder && selectedFolder.isImage ? (
              <Image
                source={{ uri: selectedFolder.path }}
                style={{ width: 200, height: 200, borderRadius: 10 }}
                resizeMode="contain"
              />
            ) : (
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <QRCode
                  value={selectedFolder?.path || ''}
                  size={150}
                  color="black"
                  backgroundColor="white"
                />
                <Text style={{ marginTop: 10 }}>{selectedFolder?.name}</Text>
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
