const BACKEND_URL = import.meta.env.PROD
  ? 'http://147.185.221.19:25874'.replace(/\/$/, '')
  : 'http://localhost:3000'.replace(/\/$/, '');

console.log('Mode:', import.meta.env.MODE);
console.log('Using API URL:', BACKEND_URL);

export const config = {
  apiUrl: BACKEND_URL
};

export default config;
