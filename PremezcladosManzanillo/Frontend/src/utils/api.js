import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001',
  withCredentials: true, // Important for sending cookies with requests
});

export let getAuthToken;

export const setGetAuthToken = fn => {
  getAuthToken = fn;
};

api.interceptors.request.use(async config => {
  if (getAuthToken) {
    try {
      const token = await getAuthToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error getting token for API request', error);
      return Promise.reject(error);
    }
  }
  return config;
});


/**
 * Checks the current user's session status.
 * @returns {Promise<object>} A promise that resolves with the user session data.
 */
export const checkSession = async () => {
  try {
    const response = await api.get('/api/auth/session');
    return response.data;
  } catch (error) {
    console.error('Error checking session:', error);
    return null;
  }
};

export default api;
