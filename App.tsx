import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './src/app/pages/home/Home';
import Profile from './src/app/pages/profile/Profile';
import Files from './src/app/pages/files/Files';
import Wallet from './src/app/pages/wallet/Wallet';
import Login from './src/app/pages/login/Login';
import Icon from 'react-native-vector-icons/Ionicons';

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
        let iconName: string = '';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          //se o usuario estiver logado mostra a tela principal com as tabs
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        ) : (
          //se o usuario não estiver logado  mostra a tela de login
          <Stack.Screen name="Login">
            {(props) => <Login {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
