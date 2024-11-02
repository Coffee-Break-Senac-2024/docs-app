import React, { useState, useContext, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../hooks/auth';
import Toast from 'react-native-toast-message';
import {
  Container,
  LogoContainer,
  Logo,
  Title,
  Input,
  LoginButton,
  ButtonText,
  ForgotPasswordButton,
  ForgotPasswordText,
  SignUpButton,
  SignUpText,
} from './styles';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const { signIn, loading: authLoading, isLoggedIn } = useContext(AuthContext);

  const handleLogin = async () => {
    setErrorMessage('');
    setLoading(true);

    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Por favor, insira o email e a senha.',
      });
      setLoading(false);
      return;
    }

    try {
      await signIn({ email, password });
     
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao fazer login. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      Toast.show({
        type: 'success',
        text1: 'Login realizado com sucesso!',
      });
      navigation.navigate('MainTabs'); 
    }
  }, [isLoggedIn]);

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

      <LoginButton onPress={handleLogin} disabled={loading || authLoading}>
        {loading || authLoading ? <ActivityIndicator size="small" color="#fff" /> : <ButtonText>Entrar</ButtonText>}
      </LoginButton>

      <ForgotPasswordButton onPress={() => Toast.show({ type: 'info', text1: 'Recuperação de senha' })}>
        <ForgotPasswordText>Esqueceu a senha?</ForgotPasswordText>
      </ForgotPasswordButton>

      <SignUpButton onPress={navigateToSignUp}>
        <SignUpText>Criar conta</SignUpText>
      </SignUpButton>
    </Container>
  );
};

export default Login;
