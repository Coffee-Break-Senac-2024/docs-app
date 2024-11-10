import axios from "axios";

export const api = axios.create({
    baseURL: 'http://ec2-54-158-18-101.compute-1.amazonaws.com:8080'
});

export const signatureApi = axios.create({
    baseURL: 'http://ec2-44-223-156-236.compute-1.amazonaws.com:8081',
    responseType: 'json',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});
