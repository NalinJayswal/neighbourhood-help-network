/**
 * Axios Instance
 * Pre-configured axios client with the backend base URL.
 * In production, this reads from the REACT_APP_API_URL environment variable.
 */

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
});

export default axiosInstance;
