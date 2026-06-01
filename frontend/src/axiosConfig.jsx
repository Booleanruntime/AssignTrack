import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development'
    ? 'http://localhost:5001/api'
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;