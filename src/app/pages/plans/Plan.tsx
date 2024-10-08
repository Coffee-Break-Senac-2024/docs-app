import React from 'react';
import { ScrollView } from 'react-native';
import { Container, Title, Description, Card, CardTitle, CardDescription } from './styles';

const Plan: React.FC = () => {
  const plans = [
    {
      id: '1',
      title: 'Mensal',
      description: 'Acesso ilimitado por 30 dias.',
    },
    {
      id: '2',
      title: 'Trimestral',
      description: 'Acesso ilimitado por 90 dias.',
    },
    {
      id: '3',
      title: 'Anual',
      description: 'Acesso ilimitado por 365 dias.',
    },
  ];

  return (
    <Container>
      <Title>Meu Plano</Title>
      <Description>Aqui estão as informações sobre o seu plano.</Description>
      <ScrollView>
        {plans.map(plan => (
          <Card key={plan.id}>
            <CardTitle>{plan.title}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </Card>
        ))}
      </ScrollView>
    </Container>
  );
};

export default Plan;
