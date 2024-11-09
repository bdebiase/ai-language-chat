const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Add debug logging
console.log('API URL:', apiUrl);
console.log('Environment:', import.meta.env.MODE); // Will show 'development' or 'production'

export const config = {
  apiUrl
};

export default config;
