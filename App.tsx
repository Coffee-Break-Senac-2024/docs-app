import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import Home from './src/app/pages/home/Home';
import Profile from './src/app/pages/profile/Profile';
import Files from './src/app/pages/files/Files';
import Wallet from './src/app/pages/wallet/Wallet';
import Login from './src/app/pages/login/Login';
import EditProfile from './src/app/pages/profile/EditProfile';
import Plan from './src/app/pages/plans/Plan';
import SignUp from './src/app/pages/signUp/SignUp';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthProvider, AuthContext } from './src/app/hooks/auth'; 

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#004aad',
      tabBarInactiveTintColor: '#888',
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

const App = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {isLoggedIn ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
              <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Editar Perfil' }} />
              <Stack.Screen name="Plan" component={Plan} options={{ title: 'Meu Plano' }} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="SignUp" component={SignUp} />
            </>
          )}
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
