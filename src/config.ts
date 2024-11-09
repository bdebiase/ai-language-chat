function getApiUrl() {
  // If we're in production (Netlify)
  if (import.meta.env.PROD) {
    return 'http://147.185.221.19:25874';
  }

  // If we have an environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback for local development
  return 'http://localhost:3000';
}

const BACKEND_URL = getApiUrl();

console.log('Using API URL:', BACKEND_URL);

export const config = {
  apiUrl: BACKEND_URL
};

export default config;
