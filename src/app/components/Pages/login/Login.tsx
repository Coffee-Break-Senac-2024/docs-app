import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /* Metodo para validar o usuario*/
  const handleLogin = () => {
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor, insira o email e a senha.');
      return;
    }

    console.log('Login com:', { email, password });
   
  };

  return (
    <Container>
      <LogoContainer>
        <Logo source={require('../../Public/images/docs2.png')} />
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

      <LoginButton onPress={handleLogin}>
        <ButtonText>Entrar</ButtonText>
      </LoginButton>

      <ForgotPasswordButton onPress={() => Alert.alert('Recuperação de senha')}>
        <ForgotPasswordText>Esqueceu a senha?</ForgotPasswordText>
      </ForgotPasswordButton>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f5;
  padding: 20px;
`;

const LogoContainer = styled.View`
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
`;

const Logo = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
`;

const Input = styled.TextInput`
  width: 100%;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;
  border-radius: 25px;
  border-color: #ddd;
  border-width: 1px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  elevation: 3;
`;

const ErrorText = styled.Text`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
`;

const LoginButton = styled.Pressable`
  width: 100%;
  padding: 15px;
  background-color: #004aad;
  border-radius: 25px;
  align-items: center;
  margin-top: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  elevation: 5;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;

const ForgotPasswordButton = styled.Pressable`
  margin-top: 15px;
`;

const ForgotPasswordText = styled.Text`
  color: #007bff;
  font-size: 14px;
`;

export default Login;
