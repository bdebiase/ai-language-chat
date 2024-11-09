const BASE_URL = import.meta.env.PROD
  ? 'http://147.185.221.19:25874/api'
  : 'http://localhost:3000/api';

export const config = {
  apiUrl: BASE_URL.replace(/\/+$/, '') // Remove any trailing slashes
};

export default config;
