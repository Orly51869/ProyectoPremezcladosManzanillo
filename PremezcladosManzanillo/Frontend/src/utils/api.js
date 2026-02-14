import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3002",
  withCredentials: true,
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

export const getDashboardStats = async (params = {}) => {
  try {
    const response = await api.get("/api/dashboard/stats", { params });
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

export const getCommercialReports = async (params = {}) => {
  const response = await api.get("/api/reports/commercial", { params });
  return response.data;
};

export const getAccountingReports = async (params = {}) => {
  const response = await api.get("/api/reports/accounting", { params });
  return response.data;
};

export const getOperationalReports = async (params = {}) => {
  const response = await api.get("/api/reports/operational", { params });
  return response.data;
};

// API de Portafolio/Proyectos
export const getProjects = async () => {
  const response = await api.get("/api/projects");
  return response.data;
};

export const createProject = async (data) => {
  const response = await api.post("/api/projects", data);
  return response.data;
};

export const updateProject = async (id, data) => {
  const response = await api.put(`/api/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/api/projects/${id}`);
  return response.data;
};

export default api;
