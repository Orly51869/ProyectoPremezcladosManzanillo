import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
dotenv.config();

const domain = process.env.AUTH0_DOMAIN || 'dev-3u2pz1qta376worq.us.auth0.com';
const audience = process.env.AUTH0_AUDIENCE || 'https://premezclados-api.com';

export const jwtCheck = auth({
  audience: audience,
  issuerBaseURL: `https://${domain}/`,
  tokenSigningAlg: 'RS256'
});
