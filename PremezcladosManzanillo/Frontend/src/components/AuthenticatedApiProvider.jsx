import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Outlet } from 'react-router-dom';
import { setGetAuthToken } from '../utils/api';

const AuthenticatedApiProvider = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setGetAuthToken(() => getAccessTokenSilently());
    setIsReady(true);
  }, [getAccessTokenSilently]);

  if (!isReady) return null;

  return <Outlet />;
};

export default AuthenticatedApiProvider;
