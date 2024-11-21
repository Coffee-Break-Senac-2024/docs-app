import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Layout from '../../pages/Layout/Layout';
import {
  Container,
  ButtonContainer,
  StyledButton,
  ButtonText,
} from './styles';

const Wallet: React.FC = () => {
  const navigation = useNavigation();

  return (
    <Layout title="Carteira">
      <Container>
        <ButtonContainer>
          <StyledButton primary onPress={() => navigation.navigate('WalletDisplay')}>
            <ButtonText>Exibir Documento</ButtonText>
          </StyledButton>
          <StyledButton onPress={() => navigation.navigate('DocumentCreate')}>
            <ButtonText>Cadastrar Documento</ButtonText>
          </StyledButton>
        </ButtonContainer>
      </Container>
    </Layout>
  );
};

export default Wallet;
