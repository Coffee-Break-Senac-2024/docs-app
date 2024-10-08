import React from 'react';
import { useNavigation } from '@react-navigation/native';
import AuthService from '../../components/Services/AuthService';
import { Container, Title, Button, ButtonText } from './styles';
import Header from '../../components/Header/Header';

const Profile: React.FC = () => {
  const navigation = useNavigation();

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleViewPlan = () => {
    navigation.navigate('Plan');
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <Container>
      <Header title="Perfil" />
      <Title>Perfil</Title>
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
