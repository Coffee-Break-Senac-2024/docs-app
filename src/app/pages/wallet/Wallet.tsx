import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import Layout from '../../pages/Layout/Layout';
import { useNavigation } from '@react-navigation/native';

const Wallet: React.FC = () => {
  const navigation = useNavigation();

  return (
    <Layout title="Carteira">
      <View style={styles.buttonContainer}>
        <Button
          title="Exibir Documento"
          onPress={() => navigation.navigate('DocumentDisplay')}
        />
        <Button
          title="Cadastrar Documento"
          onPress={() => navigation.navigate('DocumentCreate')}
          color="#004aad"
        />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
});

export default Wallet;
