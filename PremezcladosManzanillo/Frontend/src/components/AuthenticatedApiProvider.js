import { useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';

const AuthenticatedApiProvider = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated, error, isLoading, user } = useAuth0();

  // Loguear cambios en el estado de autenticación de Auth0
  useEffect(() => {
    console.log('[Auth-Status] Is loading:', isLoading);
    console.log('[Auth-Status] Is authenticated:', isAuthenticated);
    if (error) {
      console.error('[Auth-Status] Authentication error:', error);
    }
    if (isAuthenticated) {
      console.log('[Auth-Status] User:', user);
    }
  }, [isLoading, isAuthenticated, error, user]);


  const setAuthHeader = useCallback(async () => {
    try {
      console.log('[Auth-Token] Attempting to get access token silently...');
      const token = await getAccessTokenSilently();
      console.log('[Auth-Token] Successfully retrieved access token.');
      api.interceptors.request.use(config => {
        console.log('[Auth-Token] Attaching token to API request.');
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      });
    } catch (error) {
      console.error('[Auth-Token] Error getting access token silently:', error);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('[Auth-Flow] User is authenticated, setting auth header.');
      setAuthHeader();
    } else {
      console.log('[Auth-Flow] User is not authenticated, skipping auth header setup.');
    }
  }, [isAuthenticated, setAuthHeader]);

  return <>{children}</>;
};

export default AuthenticatedApiProvider;
