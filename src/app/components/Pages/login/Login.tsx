import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  Container, 
  LogoContainer, 
  Logo, 
  Title, 
  Input, 
  ErrorText, 
  LoginButton, 
  ButtonText, 
  ForgotPasswordButton, 
  ForgotPasswordText 
} from './styles';

interface LoginProps {
  setIsLoggedIn: (loggedIn: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setErrorMessage('');
    setLoading(true);

    if (!email || !password) {
      setErrorMessage('Por favor, insira o email e a senha.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      Alert.alert('Login realizado com sucesso!');
      setIsLoggedIn(true);
    }, 1000);
  };

  return (
    <Container>
      <LogoContainer>
        <Logo source={require('../../public/images/docs2.png')} />
      </LogoContainer>

      <Title>Bem-vindo(a) ao App Docs</Title>

      <Input
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        inputMode="email"
        autoCapitalize="none"
      />

      <Input
        placeholder="Senha"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}

      <LoginButton onPress={handleLogin} disabled={loading}>
        <ButtonText>{loading ? 'Entrando...' : 'Entrar'}</ButtonText>
      </LoginButton>

      <ForgotPasswordButton onPress={() => Alert.alert('Recuperação de senha')}>
        <ForgotPasswordText>Esqueceu a senha?</ForgotPasswordText>
      </ForgotPasswordButton>
    </Container>
  );
};

export default Login;
