import React, { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../hooks/auth';
import { useSignature } from '../../hooks/signature';
import { Container, Title, Button, ButtonText, InfoBox, StyledLabel, StyledValue } from './styles';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header/Header';

const Profile: React.FC = () => {
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext);
  const { userSignature } = useSignature();

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleViewPlan = () => {
    navigation.navigate('Plan');
  };

  const handleLogout = async () => {
    try {
      await signOut();

      Toast.show({
        type: 'success',
        text1: 'Logout realizado com sucesso!',
      });

    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <Container>
      <Header title="Perfil" />
      <Title>Perfil do Usuário</Title>

      {userSignature ? (
        <InfoBox>
          <StyledLabel>Tipo de Assinatura:</StyledLabel>
          <StyledValue>{userSignature.signature}</StyledValue>

          <StyledLabel>Data da Assinatura:</StyledLabel>
          <StyledValue>
            {new Date(userSignature.signedAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </StyledValue>

          <StyledLabel>Documentos Cadastrados:</StyledLabel>
          <StyledValue>{userSignature.documentCount}</StyledValue>
        </InfoBox>
      ) : (
        <StyledLabel>Assinatura: Não possui</StyledLabel>
      )}

      <Button onPress={handleEditProfile}>
        <ButtonText>Editar Perfil</ButtonText>
      </Button>
      <Button onPress={handleViewPlan}>
        <ButtonText>Plano</ButtonText>
      </Button>
      <Button onPress={handleLogout}>
        <ButtonText>Sair</ButtonText>
      </Button>
    </Container>
  );
};

export default Profile;
