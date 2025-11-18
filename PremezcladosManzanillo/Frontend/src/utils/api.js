import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  withCredentials: true, // Important for sending cookies with requests
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
