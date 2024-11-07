import React, { useState, useEffect } from 'react';
import { Button, Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Container, Title, Description, Card, CardTitle, CardDescription } from './styles';
import Toast from 'react-native-toast-message';
import { useSignature } from '../../hooks/signature';

const Plan: React.FC = () => {
  const { changeSignaturePlan, userSignature, getSignature } = useSignature();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const plans = [
    {
      id: '1',
      title: 'Mensal',
      description: 'Acesso ilimitado por 30 dias.',
      type: 'MONTHLY',
    },
    {
      id: '2',
      title: 'Trimestral',
      description: 'Acesso ilimitado por 90 dias.',
      type: 'QUARTERLY',
    },
    {
      id: '3',
      title: 'Anual',
      description: 'Acesso ilimitado por 365 dias.',
      type: 'ANNUAL',
    },
  ];

  useEffect(() => {
    getSignature();
  }, []);

  const handleConfirmPlanChange = async () => {
    if (selectedPlan) {
      try {
        const responseStatus = await changeSignaturePlan({ signature: selectedPlan });
        if (responseStatus === 200) {
          Toast.show({
            type: 'success',
            text1: 'Sucesso',
            text2: 'Plano alterado com sucesso.',
          });
          getSignature();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Falha ao alterar o plano. Tente novamente.',
          });
        }
      } catch (error) {
        console.error('Erro ao alterar o plano:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Erro inesperado ao tentar alterar o plano.',
        });
      } finally {
        setModalVisible(false);
      }
    }
  };

  const openConfirmationModal = (planType: string) => {
    setSelectedPlan(planType);
    setModalVisible(true);
  };

  return (
    <Container>
      <Title>Meu Plano</Title>
      
      {userSignature ? (
        <Card>
          <CardTitle>Plano Atual: {userSignature.signature}</CardTitle>
          <CardDescription>Início: {new Date(userSignature.signedAt).toLocaleDateString()}</CardDescription>
          <CardDescription>Documentos Cadastrados: {userSignature.documentCount}</CardDescription>
        </Card>
      ) : (
        <Description>Carregando informações do plano atual...</Description>
      )}

      <Description>Escolha um novo plano abaixo.</Description>

      <ScrollView>
        {plans.map(plan => (
          <Card key={plan.id}>
            <CardTitle>{plan.title}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <Button
              title={`Selecionar ${plan.title}`}
              onPress={() => openConfirmationModal(plan.type)}
            />
          </Card>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Confirmação de Alteração</Text>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>Tem certeza de que deseja alterar para o plano selecionado?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={{ padding: 10, backgroundColor: '#004aad', borderRadius: 5, marginRight: 10 }}
                onPress={handleConfirmPlanChange}
              >
                <Text style={{ color: 'white' }}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5 }}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast />
    </Container>
  );
};

export default Plan;
