import React from 'react';
import Layout from '../../pages/Layout/Layout';
import FolderList from '../../components/Folders/FolderList';

const Home: React.FC = () => {
  return (
    <Layout title="Bem-vindo!">
      <FolderList />
    </Layout>
  );
};
export default Home;
