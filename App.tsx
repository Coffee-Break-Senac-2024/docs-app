import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Text, View } from 'react-native';
import { useStyles } from './styles';
import Header from './src/app/components/Header/Header';

export default function App() {

  const styles = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <Header />
    </SafeAreaView>
  );
}

