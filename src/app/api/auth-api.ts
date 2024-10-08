import axios from "axios";

export const api = axios.create({
    baseURL: 'http://ec2-98-84-198-212.compute-1.amazonaws.com:8080'
});