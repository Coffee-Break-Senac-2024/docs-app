import React, { useState } from 'react';
import { View, Modal, FlatList, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import {
    Container,
    Title,
    FormContainer,
    Input,
    Label,
    ButtonContainer,
    FileName,
    StyledButton,
    ButtonText,
} from './stylesCreate';
import { useWallet } from '../../hooks/wallet';
import { AxiosError } from 'axios';

interface FileWithUri {
    uri: string | undefined;
    name: string;
    type: string;
}

const Wallet: React.FC = () => {
    const [documentName, setDocumentName] = useState('');
    const [walletDocumentType, setWalletDocumentType] = useState('');
    const [file, setFile] = useState<FileWithUri | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const { createDocument, error } = useWallet();

    const documentTypes = ['RG', 'CNH'];

    const handleFileUpload = async () => {
        // Pedir permissões de mídia
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!granted) {
            Toast.show({ type: 'error', text1: 'Permissão negada', text2: 'É necessária permissão para acessar a galeria.' });
            return;
        }

        // Abrir galeria
        const { assets, canceled } = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            base64: false,
            aspect: [4, 4],
            quality: 1,
        });

        if (!canceled && assets && assets.length > 0) {
            const fileName = assets[0].uri.substring(assets[0].uri.lastIndexOf('/') + 1, assets[0].uri.length);
            const extend = fileName.split('.')[1];

            setFile({
                uri: assets[0].uri,
                name: fileName,
                type: 'image/' + extend || 'image/jpeg',
            });

            Toast.show({ type: 'success', text1: 'Arquivo selecionado', text2: fileName! });
        } else if (canceled) {
            Toast.show({ type: 'info', text1: 'Seleção de arquivo cancelada' });
        } else {
            Toast.show({ type: 'error', text1: 'Erro ao selecionar arquivo' });
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

    const handleSelectType = (type: string) => {
        setWalletDocumentType(type);
        setDropdownVisible(false);
    };

    return (
        <Container>
            <Title>Cadastro</Title>
            <FormContainer>
                <Label>Nome do Documento</Label>
                <Input
                    placeholder="Nome do Documento"
                    value={documentName}
                    onChangeText={setDocumentName}
                />

                <Label>Tipo de Documento</Label>
                <TouchableOpacity onPress={() => setDropdownVisible(true)}>
                    <View
                        style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            borderRadius: 10,
                            padding: 10,
                            backgroundColor: '#fff',
                            marginBottom: 15,
                        }}
                    >
                        <Text>{walletDocumentType || 'Selecione o tipo de documento'}</Text>
                    </View>
                </TouchableOpacity>

                <Modal visible={dropdownVisible} transparent>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }}
                        onPress={() => setDropdownVisible(false)}
                    >
                        <View
                            style={{
                                width: '80%',
                                backgroundColor: '#fff',
                                borderRadius: 10,
                                padding: 20,
                            }}
                        >
                            <FlatList
                                data={documentTypes}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleSelectType(item)}>
                                        <Text style={{ padding: 10, fontSize: 16 }}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Label>Arquivo</Label>
                <ButtonContainer>
                    <StyledButton onPress={handleFileUpload}>
                        <ButtonText>Selecionar Arquivo</ButtonText>
                    </StyledButton>
                </ButtonContainer>
                {file && <FileName>Arquivo Selecionado: {file.name}</FileName>}
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
