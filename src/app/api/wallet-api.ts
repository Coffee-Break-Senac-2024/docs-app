import axios from "axios";

export const walletApi = axios.create({
    baseURL: 'http://ec2-54-82-186-117.compute-1.amazonaws.com:8082'
});
