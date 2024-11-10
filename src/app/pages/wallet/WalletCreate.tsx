import React, { useState } from 'react';
import { View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
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
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true },
      (response) => {
        if (response.didCancel) {
          Toast.show({
            type: 'info',
            text1: 'Seleção de arquivo cancelada',
          });
        } else if (response.errorMessage) {
          Toast.show({
            type: 'error',
            text1: 'Erro ao selecionar arquivo',
            text2: response.errorMessage,
          });
        } else if (response.assets && response.assets.length > 0) {
          const selectedFile = response.assets[0];
          setFile(selectedFile);
          Toast.show({
            type: 'success',
            text1: 'Arquivo selecionado',
            text2: selectedFile.fileName || selectedFile.uri.split('/').pop(),
          });
        }
      }
    );
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
        file: {
          uri: file.uri,
          name: file.fileName,
          type: file.type,
        },
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
          <FileName>Arquivo Selecionado: {file.fileName || file.uri.split('/').pop()}</FileName>
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
