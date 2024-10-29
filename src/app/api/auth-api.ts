import axios from "axios";

export const api = axios.create({
    baseURL: 'http://ec2-98-84-198-212.compute-1.amazonaws.com:8080'
});

export const signatureApi = axios.create({
    baseURL: 'http://ec2-3-232-161-162.compute-1.amazonaws.com:8081',
    responseType: 'json',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});
