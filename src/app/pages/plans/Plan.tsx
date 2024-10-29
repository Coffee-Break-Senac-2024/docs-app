import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native'; // Importando ActivityIndicator
import { Container, Title, Description, Card, CardTitle, CardDescription } from './styles';
import { useSignature } from '../../hooks/signature';

const Plan: React.FC = () => {
    const { getSignature, userSignature } = useSignature();
    const [loading, setLoading] = useState(false);

    const handleGetSignature = useCallback(async () => {
        setLoading(true);
        await getSignature();
        setLoading(false);

        console.log(userSignature?.signatureType, 'userSignature');
    }, [getSignature]);

    useEffect(() => {
        handleGetSignature();
    }, [handleGetSignature]);

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
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <Title>Meu Plano é {userSignature?.signatureType}</Title>
                    <Description>Aqui estão as informações sobre o seu plano.</Description>
                    <ScrollView>
                        {plans.map(plan => (
                            <Card key={plan.id}>
                                <CardTitle>{plan.title}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </Card>
                        ))}
                    </ScrollView>
                </>
            )}
        </Container>
    );
};

export default Plan;
