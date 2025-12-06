import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Outlet } from 'react-router-dom';
import { setGetAuthToken } from '../utils/api';

const AuthenticatedApiProvider = () => {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setGetAuthToken(() => getAccessTokenSilently());
  }, [getAccessTokenSilently]);

  return <Outlet />;
};

export default AuthenticatedApiProvider;
