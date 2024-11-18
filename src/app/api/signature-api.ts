import axios from "axios";

export const signatureApi = axios.create({
    baseURL: 'http://ec2-52-205-92-101.compute-1.amazonaws.com:8081'
});
    