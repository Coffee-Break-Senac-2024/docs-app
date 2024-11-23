import React, { useContext } from 'react';
import { AuthContext } from '../../hooks/auth';
import { Container, Button, ButtonText} from './styles';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header/Header';

const Profile: React.FC = () => {
  const { signOut } = useContext(AuthContext);

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
      <Button onPress={handleLogout}>
        <ButtonText>Sair</ButtonText>
      </Button>
    </Container>
  );
};

export default Profile;
