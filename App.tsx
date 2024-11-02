import React, { useContext, useEffect } from 'react';
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
import PlanSelection from './src/app/pages/plans/PlanSelection';

import { AuthProvider, AuthContext } from './src/app/hooks/auth';
import { SignatureProvider, useSignature } from './src/app/hooks/signature';

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
  const { getSignature, userSignature } = useSignature();

  useEffect(() => {
    const fetchSignature = async () => {
      if (isLoggedIn) {
        await getSignature(); 
      }
    };
    fetchSignature();
  }, [isLoggedIn, getSignature]);

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        userSignature ? (
          <>
            <Stack.Screen name="AuthenticatedTabs" component={AuthenticatedTabs} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Editar Perfil' }} />
          </>
        ) : (
          <Stack.Screen name="PlanSelection" component={PlanSelection} options={{ title: 'Escolha um Plano' }} />
        )
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
      <SignatureProvider>
        <NavigationContainer>
          <AppNavigator />
          <Toast />
        </NavigationContainer>
      </SignatureProvider>
    </AuthProvider>
  );
};

export default App;
