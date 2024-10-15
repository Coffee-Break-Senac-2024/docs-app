import React, { useState, useContext } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../hooks/auth';
import Toast from 'react-native-toast-message';
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
  ForgotPasswordText,
  SignUpButton,
  SignUpText,
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

  // Usa o AuthContext para acessar signIn e outros estados
  const { signIn, error, loading: authLoading } = useContext(AuthContext);

  const handleLogin = async () => {
    setErrorMessage('');
    setLoading(true);

    if (!email || !password) {
      setErrorMessage('Por favor, insira o email e a senha.');
      setLoading(false);
      return;
    }

    try {
      await signIn({ email, password });
      Toast.show({
        type: 'success',
        text1: 'Login realizado com sucesso!',
      });
      setIsLoggedIn(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <Container>
      <LogoContainer>
        <Logo source={require('../../components/Public/images/docs2.png')} />
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

      <LoginButton onPress={handleLogin} disabled={loading || authLoading}>
        {loading || authLoading ? <ActivityIndicator size="small" color="#fff" /> : <ButtonText>Entrar</ButtonText>}
      </LoginButton>

      <ForgotPasswordButton onPress={() => Alert.alert('Recuperação de senha')}>
        <ForgotPasswordText>Esqueceu a senha?</ForgotPasswordText>
      </ForgotPasswordButton>

      <SignUpButton onPress={navigateToSignUp}>
        <SignUpText>Criar conta</SignUpText>
      </SignUpButton>
    </Container>
  );
};

export default Login;
