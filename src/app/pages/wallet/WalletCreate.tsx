import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { Container, Title, FormContainer, Input, Label, ButtonContainer, FileName, StyledButton, ButtonText } from './styles';
import { useWallet } from '../../hooks/wallet';
import { AxiosError } from 'axios';

interface FileWithUri {
  uri: string;
  name: string;
  type: string;
}

const Wallet: React.FC = () => {
  const [documentName, setDocumentName] = useState('');
  const [walletDocumentType, setWalletDocumentType] = useState('');
  const [file, setFile] = useState<FileWithUri | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
          setFile({
            uri: selectedFile.uri,
            name: selectedFile.fileName || selectedFile.uri.split('/').pop(),
            type: selectedFile.type,
          });
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
  
    setIsLoading(true);

    try {
      const status = await createDocument({
        file,
        documentName,
        walletDocumentType,
      });
  
      if (status === 200) {
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
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <Container>
      <Title>Cadastro de Documentos</Title>
      <FormContainer>
        <Label>Nome do Documento</Label>
        <Input
          placeholder="Nome do Documento"
          value={documentName}
          onChangeText={setDocumentName}
        />
        <Label>Tipo de Documento</Label>
        <Picker
          selectedValue={walletDocumentType}
          onValueChange={(itemValue) => setWalletDocumentType(itemValue)}
          style={{ height: 50, width: '100%', marginBottom: 15, borderRadius: 10 }}
        >
          <Picker.Item label="Selecione o tipo de documento" value="" />
          <Picker.Item label="RG" value="RG" />
          <Picker.Item label="CNH" value="CNH" />
        </Picker>
        <Label>Arquivo</Label>
        <ButtonContainer>
          <StyledButton onPress={handleFileUpload}>
            <ButtonText>Selecionar Arquivo</ButtonText>
          </StyledButton>
        </ButtonContainer>
        {file && (
          <FileName>Arquivo Selecionado: {file.name}</FileName>
        )}
        <ButtonContainer>
          <StyledButton onPress={handleSubmit} primary>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ButtonText>Cadastrar Documento</ButtonText>
            )}
          </StyledButton>
        </ButtonContainer>
      </FormContainer>
    </Container>
  );
};

export default Wallet;
