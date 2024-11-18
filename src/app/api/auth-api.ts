import axios from "axios";

export const api = axios.create({
    baseURL: 'http://ec2-3-214-55-54.compute-1.amazonaws.com:8080'
});

export const signatureApi = axios.create({
    baseURL: 'http://ec2-52-205-92-101.compute-1.amazonaws.com:8081',
    responseType: 'json',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});
