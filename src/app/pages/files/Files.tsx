import React from 'react';
import { Container, Title, Description } from './styles';
import Header from '../../components/Header/Header'; 

const Files: React.FC = () => {
  return (
    <Container>
      <Header title="Meus Arquivos" /> 
      <Title>Meus Arquivos</Title>
      <Description>Arquivos salvos.</Description>
    </Container>
  );
};

export default Files;
