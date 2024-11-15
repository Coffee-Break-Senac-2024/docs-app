import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import Home from './src/app/pages/home/Home';
import Profile from './src/app/pages/profile/Profile';
import Files from './src/app/pages/files/Files';
import Wallet from './src/app/pages/wallet/Wallet';
import Login from './src/app/pages/login/Login';
import SignUp from './src/app/pages/signUp/SignUp';
import EditProfile from './src/app/pages/profile/EditProfile';
import Plan from './src/app/pages/plans/Plan';
import WalletDisplay from './src/app/pages/wallet/WalletDisplay';
import DocumentCreate from './src/app/pages/wallet/WalletCreate';

import { AuthProvider, AuthContext } from './src/app/hooks/auth';
import { WalletProvider } from './src/app/hooks/wallet';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthenticatedTabs = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: '#004aad',
      tabBarInactiveTintColor: '#888',
      headerShown: false,
      tabBarStyle: {
        paddingBottom: 10,
        height: 60,
      },
      tabBarIcon: ({ color, size }) => {
        let iconName = '';
        if (route.name === 'Home') {
          iconName = 'home-outline';
        } else if (route.name === 'Profile') {
          iconName = 'person-outline';
        } else if (route.name === 'Files') {
          iconName = 'folder-outline';
        } else if (route.name === 'Wallet') {
          iconName = 'wallet-outline';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={Home} options={{ title: 'Início' }} />
    <Tab.Screen name="Files" component={Files} options={{ title: 'Meus Arquivos' }} />
    <Tab.Screen name="Wallet" component={Wallet} options={{ title: 'Carteira' }} />
    <Tab.Screen name="Profile" component={Profile} options={{ title: 'Perfil' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#004aad" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <>
          <Stack.Screen
            name="AuthenticatedTabs"
            component={AuthenticatedTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Editar Perfil' }} />
          <Stack.Screen name="Plan" component={Plan} options={{ title: 'Alterar Plano' }} />
          <Stack.Screen name="WalletDisplay" component={WalletDisplay} options={{ title: 'Exibir Documento' }} />
          <Stack.Screen name="DocumentCreate" component={DocumentCreate} options={{ title: 'Cadastrar Documento' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUp} options={{ title: 'Cadastrar-se' }} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <WalletProvider>
        <NavigationContainer>
          <AppNavigator />
          <Toast />
        </NavigationContainer>
      </WalletProvider>
    </AuthProvider>
  );
};

export default App;
