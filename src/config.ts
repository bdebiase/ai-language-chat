// In production (Vercel), use the relative path which will be handled by the rewrite
// In development, use the direct URL
const API_URL = import.meta.env.PROD
  ? '' // Empty string means use relative URLs
  : 'http://147.185.221.19:25874';

console.log('Mode:', import.meta.env.MODE);
console.log('Using API URL:', API_URL || 'relative path (production)');

export const config = {
  apiUrl: API_URL
};

export default config;
