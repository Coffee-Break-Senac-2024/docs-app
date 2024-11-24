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
} from './styles';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password: string) => {
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

const removeCpfMask = (cpf: string) => cpf.replace(/\D/g, '');

const SignUp = () => {
  const { signUp, loading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!name || !cpf || !email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, preencha todos os campos.',
      });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, insira um e-mail válido.',
      });
      return;
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: passwordValidation.message,
      });
      return;
    }

    const cleanedCpf = removeCpfMask(cpf);

    try {
      const status = await signUp({ name, document: cleanedCpf, email, password });

      if (status === 200 || status === 201) {
        Toast.show({
          type: 'success',
          text1: 'Cadastro realizado com sucesso!',
          text2: 'Você já pode fazer login.',
        });
        navigation.navigate('Login');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao realizar cadastro',
          text2: 'Ocorreu um erro ao cadastrar. Tente novamente.',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro ao realizar cadastro',
        text2: 'Ocorreu um erro ao tentar cadastrar. Tente novamente.',
      });
    }
  };

  return (
    <Container>
      <Title>Criar Conta</Title>

      <Input
        placeholder="Nome"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TextInputMask
        type={'cpf'}
        placeholder="CPF"
        placeholderTextColor="#888"
        value={cpf}
        onChangeText={setCpf}
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

      <RegisterButton onPress={handleRegister} disabled={loading}>
        <ButtonText>{loading ? 'Cadastrando...' : 'Criar Conta'}</ButtonText>
      </RegisterButton>
      <Toast />
    </Container>
  );
};

export default SignUp;
