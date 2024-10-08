import React from 'react';
import { Container, Title, Description } from './styles';
import Header from '../../components/Header/Header'; 

const Wallet: React.FC = () => {
  return (
    <Container>
      <Header title="Carteira" />
      <Title>Carteira</Title>
      <Description>Meus Documentos.</Description>
    </Container>
  );
};

export default Wallet;
