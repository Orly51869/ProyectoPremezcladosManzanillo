import { auth } from 'express-oauth2-jwt-bearer';

export const jwtCheck = auth({
  audience: 'https://premezclados-api.com',
  issuerBaseURL: 'https://dev-bellooswaldo.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});
