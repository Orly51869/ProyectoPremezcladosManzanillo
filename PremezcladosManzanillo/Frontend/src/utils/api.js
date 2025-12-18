import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3001",
  withCredentials: true, // Importante para enviar cookies en las solicitudes
});

export let getAuthToken;

export const setGetAuthToken = (fn) => {
  getAuthToken = fn;
};

api.interceptors.request.use(async (config) => {
  if (getAuthToken) {
    try {
      const token = await getAuthToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Error getting token for API request", error);
      return Promise.reject(error);
    }
  }
  return config;
});

/**
 * Comprueba el estado de sesión del usuario actual.
 * @returns {Promise<object>} Promesa que resuelve con los datos de la sesión del usuario.
 */
export const checkSession = async () => {
  try {
    const response = await api.get("/api/auth/session");
    return response.data;
  } catch (error) {
    console.error("Error checking session:", error);
    return null;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get("/api/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const getRecentActivity = async () => {
  try {
    const response = await api.get("/api/dashboard/recent-activity");
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }
};

export const getExchangeRates = async () => {
  try {
    const response = await api.get("/api/currency/rates");
    return response.data;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
};

export default api;
