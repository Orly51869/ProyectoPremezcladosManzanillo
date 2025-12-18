import React, { createContext, useContext, useState, useEffect } from 'react';
import { getExchangeRates } from '../utils/api';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'VES'
  const [exchangeRate, setExchangeRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isManual, setIsManual] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRates = async () => {
    if (isManual) return; // Don't overwrite manual rate automatically
    setLoading(true);
    const rates = await getExchangeRates();
    if (rates && rates.USD) {
      setExchangeRate(rates.USD);
      setLastUpdated(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []); // Run once on mount

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'VES' : 'USD');
  };

  const updateRateManual = (newRate) => {
    setExchangeRate(parseFloat(newRate));
    setIsManual(true);
    setLastUpdated(new Date());
  };
  
  const resetToOfficial = () => {
      setIsManual(false);
      fetchRates();
  }

  const formatPrice = (amountInUSD) => {
    if (amountInUSD === undefined || amountInUSD === null) return '-';
    if (currency === 'USD') {
      return amountInUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    } else {
      const rate = exchangeRate || 0; 
      const val = amountInUSD * rate;
      return val.toLocaleString('es-VE', { style: 'currency', currency: 'VES' });
    }
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      exchangeRate,
      lastUpdated,
      isManual,
      loading,
      toggleCurrency,
      updateRateManual,
      resetToOfficial,
      formatPrice,
      refreshRates: fetchRates
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
