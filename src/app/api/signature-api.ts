import axios from "axios";

export const signatureApi = axios.create({
    baseURL: 'http://ec2-3-232-161-162.compute-1.amazonaws.com:8081'
});
    