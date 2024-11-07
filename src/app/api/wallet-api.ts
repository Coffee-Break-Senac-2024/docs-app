import axios from "axios";

export const walletApi = axios.create({
    baseURL: 'http://ec2-52-201-168-41.compute-1.amazonaws.com:8082'
});
    