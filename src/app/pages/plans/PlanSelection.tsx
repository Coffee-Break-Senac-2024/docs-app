import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSignature } from '../../hooks/signature';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../hooks/auth'; 

const PlanSelection: React.FC = () => {
    const { userSignature, getSignature, assignSignature } = useSignature();
    const { signOut } = useContext(AuthContext);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    useEffect(() => {
        const fetchSignature = async () => {
            await getSignature();
        };

        fetchSignature();
    }, []);

    const handleSelectPlan = (plan: string) => {
        setSelectedPlan(plan);
    };

    const handleConfirmPlan = async () => {
        if (!selectedPlan) return;

        const responseStatus = await assignSignature({ signatureType: selectedPlan as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' });

        if (responseStatus === 200 || responseStatus === 201) {
            Toast.show({ type: 'success', text1: 'Assinatura cadastrada com sucesso!' });
        } else {
            Toast.show({ type: 'error', text1: 'Erro ao cadastrar assinatura.' });
        }
    };

    const handleLogout = async () => {
        await signOut(); 
        Toast.show({ type: 'info', text1: 'Você foi desconectado!' });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Selecione um plano de assinatura</Text>

            <View style={styles.planContainer}>
                <TouchableOpacity
                    style={[styles.planButton, selectedPlan === 'MONTHLY' && styles.selectedPlan]}
                    onPress={() => handleSelectPlan('MONTHLY')}
                >
                    <Text style={styles.planText}>Assinatura Mensal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.planButton, selectedPlan === 'QUARTERLY' && styles.selectedPlan]}
                    onPress={() => handleSelectPlan('QUARTERLY')}
                >
                    <Text style={styles.planText}>Assinatura Trimestral</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.planButton, selectedPlan === 'ANNUAL' && styles.selectedPlan]}
                    onPress={() => handleSelectPlan('ANNUAL')}
                >
                    <Text style={styles.planText}>Assinatura Anual</Text>
                </TouchableOpacity>
            </View>

            {selectedPlan && (
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPlan}>
                    <Text style={styles.confirmText}>Confirmar Plano</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#004aad',
    },
    planContainer: {
        width: '100%',
        marginBottom: 20,
    },
    planButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginBottom: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedPlan: {
        borderColor: '#004aad',
        backgroundColor: '#e0f0ff',
    },
    planText: {
        fontSize: 18,
        color: '#333',
    },
    confirmButton: {
        backgroundColor: '#004aad',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 8,
        marginTop: 20,
    },
    confirmText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#d9534f',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 8,
        marginTop: 20,
    },
    logoutText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PlanSelection;
