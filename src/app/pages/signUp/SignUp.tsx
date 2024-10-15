import React, { useContext, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native'; 
import { TextInputMask } from 'react-native-masked-text';
import { AuthContext } from '../../hooks/auth';
import {
  Container,
  Input,
  RegisterButton,
  ButtonText,
  Title,
  ErrorText,
} from './styles';

// Validações
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'A senha deve ter pelo menos 8 caracteres.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula.' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra minúscula.' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos um número.' };
  }

  if (!/[@$!%*?&]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos um caractere especial.' };
  }

  return { valid: true, message: '' };
};

const removeCpfMask = (cpf) => cpf.replace(/\D/g, '');

const SignUp = () => {
  const { signUp, loading, error } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation();

  const handleRegister = async () => {
    setErrorMessage(''); 

    if (!name || !cpf || !email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Por favor, insira um e-mail válido.');
      return;
    }

    const passwordValidation = isValidPassword(password);
    
    if (!passwordValidation.valid) {
      setErrorMessage(passwordValidation.message || 'Erro na validação da senha.');
      return;
    }

    const cleanedCpf = removeCpfMask(cpf);

    try {
      await signUp({ name, cpf: cleanedCpf, email, password });
       
      Toast.show({
        type: 'success',
        text1: 'Cadastro realizado com sucesso! Efetue o Login.',
      });

      navigation.navigate('Login');  
    } catch (error) {
      const errorMsg = error.message || 'Erro desconhecido ao cadastrar. Tente novamente.';

      Toast.show({
        type: 'error',
        text1: 'Erro ao realizar cadastro! Tente Novamente.',
      });

      setErrorMessage(errorMsg);
    }
  };

  const clearErrorMessage = () => {
    setErrorMessage(''); 
  };

  return (
    <Container>
      <Title>Criar Conta</Title>

      <Input
        placeholder="Nome"
        placeholderTextColor="#888"
        value={name}
        onChangeText={(text) => {
          setName(text);
          clearErrorMessage();
        }}
      />

      <TextInputMask
        type={'cpf'}
        placeholder="CPF"
        placeholderTextColor="#888"
        value={cpf}
        onChangeText={(text) => {
          setCpf(text);
          clearErrorMessage(); 
        }}
        style={{
          width: '100%',
          padding: 15,
          marginBottom: 15,
          backgroundColor: '#fff',
          borderRadius: 25,
          borderColor: '#ddd',
          borderWidth: 1,
        }}
      />

      <Input
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          clearErrorMessage(); 
        }}
        inputMode="email"
        autoCapitalize="none"
      />

      <Input
        placeholder="Senha"
        placeholderTextColor="#888"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          clearErrorMessage(); 
        }}
        secureTextEntry
      />

      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      {error ? <ErrorText>{error}</ErrorText> : null}

      <RegisterButton onPress={handleRegister} disabled={loading}>
        <ButtonText>{loading ? 'Cadastrando...' : 'Criar Conta'}</ButtonText>
      </RegisterButton>
    </Container>
  );
};

export default SignUp;
