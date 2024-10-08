import React from 'react';
import { Container, Title } from './styles';
import FolderList from '../../components/Folders/FolderList';

const Home: React.FC = () => {
  return (
    <Container>
      <Title>Bem-vindo!</Title>
      <FolderList />
    </Container>
  );
};

export default Home;
