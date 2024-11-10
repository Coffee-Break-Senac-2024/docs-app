import axios from "axios";

export const signatureApi = axios.create({
    baseURL: 'http://ec2-44-223-156-236.compute-1.amazonaws.com:8081'
});
    