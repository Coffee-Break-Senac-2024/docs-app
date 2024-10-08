// src/components/FolderList.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Container, FolderItem, FolderName, ErrorText } from './styles'; // Importando os estilos

const FolderList: React.FC = () => {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = [
          { id: '1', name: 'Documentos' },
          { id: '2', name: 'Imagens' },
          { id: '3', name: 'Escola' },
          { id: '4', name: 'Saúde' },
          { id: '5', name: 'Boletos' },
          { id: '5', name: 'Apostas'},
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

  const renderItem = ({ item }: { item: { name: string } }) => (
    <FolderItem>
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
      />
    </Container>
  );
};

export default FolderList;
