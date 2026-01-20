"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAuth0UserRoles = exports.fetchAuth0User = exports.getManagementToken = void 0;
const getManagementToken = async () => {
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
    if (!response.ok)
        throw new Error(data.error_description || 'Failed to get management token');
    return data.access_token;
};
exports.getManagementToken = getManagementToken;
const fetchAuth0User = async (userId) => {
    try {
        const token = await (0, exports.getManagementToken)();
        const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
            return null;
        return await response.json();
    }
    catch (error) {
        console.error('[Auth0 Utility] Error fetching user:', error);
        return null;
    }
};
exports.fetchAuth0User = fetchAuth0User;
const fetchAuth0UserRoles = async (userId) => {
    try {
        const token = await (0, exports.getManagementToken)();
        const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}/roles`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
            return [];
        return await response.json();
    }
    catch (error) {
        console.error('[Auth0 Utility] Error fetching user roles:', error);
        return [];
    }
};
exports.fetchAuth0UserRoles = fetchAuth0UserRoles;
