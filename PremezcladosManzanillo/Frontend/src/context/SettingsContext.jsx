import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    company_name: "PREMEZCLADOS MANZANILLO, C.A.",
    company_rif: "J-29762187-3",
    company_phone: "0295-8726210",
    company_address: "Av. 31 de Julio, Edif Cantera Manzanillo, Sector Guatamare",
    company_logo: "/assets/LOGO_PREMEZCLADOS.svg",
    company_iva: "16",
    company_igtf: "3"
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/settings');
      
      // Combinar los valores del servidor con los valores por defecto
      setSettings(prev => ({
        ...prev,
        ...data
      }));
    } catch (error) {
      console.error("Error fetching settings context:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key, value) => {
    try {
      await api.post('/api/settings', { key, value });
      setSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      refreshSettings: fetchSettings,
      updateSetting
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
