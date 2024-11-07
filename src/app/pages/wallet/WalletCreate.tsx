import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import { Container, Title, Description, Input, Label, ButtonContainer, FileName, StyledButton, ButtonText } from './styles';
import Header from '../../components/Header/Header';
import { useWallet } from '../../hooks/wallet';
import { AxiosError } from 'axios';

const Wallet: React.FC = () => {
  const [documentName, setDocumentName] = useState('');
  const [walletDocumentType, setWalletDocumentType] = useState('');
  const [file, setFile] = useState(null);
  
  const { createDocument, error } = useWallet();

  const handleFileUpload = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
          setFile(selectedFile);
          Toast.show({
            type: 'success',
            text1: 'Arquivo selecionado',
            text2: selectedFile.name,
          });
        }
      };
      input.click();
    } else {
      try {
        const result = await DocumentPicker.getDocumentAsync({});
        if (result.type === 'success') {
          setFile(result);
          Toast.show({
            type: 'success',
            text1: 'Arquivo selecionado',
            text2: result.name,
          });
        } else {
          Toast.show({
            type: 'info',
            text1: 'Seleção de arquivo cancelada',
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao selecionar arquivo',
          text2: error.message,
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!documentName || !walletDocumentType || !file) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha todos os campos e selecione um arquivo',
      });
      return;
    }
  
    try {
      const status = await createDocument({
        file: file,
        documentName,
        walletDocumentType,
      });
  
      if (status === 201) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Documento cadastrado com sucesso!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: error || 'Erro ao cadastrar documento',
        });
      }
    } catch (e) {
      console.log('Erro ao cadastrar documento:', e); 
      if (e instanceof AxiosError) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao cadastrar documento',
          text2: e.response?.data?.message || e.message || 'Erro desconhecido',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro desconhecido',
          text2: 'Erro ao cadastrar documento',
        });
      }
    }
  };

  return (
    <Container>
      <Header title="Carteira" />
      <Title>Carteira</Title>
      <Description>Meus Documentos</Description>
      <View>
        <Label>Nome do Documento</Label>
        <Input
          placeholder="Nome do Documento"
          value={documentName}
          onChangeText={setDocumentName}
        />
        <Label>Tipo de Documento</Label>
        <Input
          placeholder="Tipo de Documento"
          value={walletDocumentType}
          onChangeText={setWalletDocumentType}
        />
        <Label>Arquivo</Label>
        <ButtonContainer>
          <StyledButton onPress={handleFileUpload}>
            <ButtonText>Selecionar Arquivo</ButtonText>
          </StyledButton>
        </ButtonContainer>
        {file && (
          <FileName>Arquivo Selecionado: {file.name || file.uri.split('/').pop()}</FileName>
        )}
        <ButtonContainer>
          <StyledButton onPress={handleSubmit} primary>
            <ButtonText>Cadastrar Documento</ButtonText>
          </StyledButton>
        </ButtonContainer>
      </View>
    </Container>
  );
};

export default Wallet;
