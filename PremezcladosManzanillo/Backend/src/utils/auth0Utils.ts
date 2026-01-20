import prisma from '../lib/prisma';

export const getManagementToken = async () => {
  const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || 'Failed to get management token');
  return data.access_token;
};

export const fetchAuth0User = async (userId: string) => {
  try {
    const token = await getManagementToken();
    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('[Auth0 Utility] Error fetching user:', error);
    return null;
  }
};

export const fetchAuth0UserRoles = async (userId: string) => {
  try {
    const token = await getManagementToken();
    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('[Auth0 Utility] Error fetching user roles:', error);
    return [];
  }
};
