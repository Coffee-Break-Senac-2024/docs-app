import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  static async login(email: string, password: string) {
    try {
      const response = await axios.post('http://ec2-98-84-198-212.compute-1.amazonaws.com:8080/api/user/auth', {
        email,
        password,
      });

      const { access_token } = response.data;

      // Salvar o token no AsyncStorage
      await AsyncStorage.setItem('access_token', access_token);

      return access_token;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  }

  static async logout() {
    try {
      // Remover o token ao fazer logout
      await AsyncStorage.removeItem('access_token');
    } catch (error) {
      throw new Error('Erro ao fazer logout ou usuário não cadastrado');
    }
  }

  static async getToken() {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      throw new Error('Erro ao recuperar o token');
    }
  }
}

export default AuthService;
