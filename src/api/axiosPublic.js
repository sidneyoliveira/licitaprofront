import axios from 'axios';

const axiosPublic = axios.create({
  baseURL: 'http://l3solution.net.br/api/',
});

export default axiosPublic;