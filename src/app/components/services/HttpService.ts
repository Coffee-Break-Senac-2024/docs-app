// src/services/HttpService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://baseurl';

const api = axios.create({
  baseURL: API_URL,
});

//adiciona o token nas requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class HttpService {

  static async getPastas() {
    try {
      const response = await api.get('/pastas'); 
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar pastas');
    }
  }
}

export default HttpService;
