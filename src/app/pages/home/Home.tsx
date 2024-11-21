import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Layout from '../../pages/Layout/Layout';
import FolderList from '../../components/Folders/FolderList';

const Home: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Layout title="Bem-vindo!">
      <FolderList />
    </Layout>
  );
};

export default Home;
