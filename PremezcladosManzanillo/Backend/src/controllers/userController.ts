import { Request, Response } from 'express';
import { ManagementClient } from 'auth0';

// Inicializar el Auth0 Management Client
const auth0 = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID!,
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET!,
});

export const getAuth0Users = async (req: Request, res: Response) => {
  try {
    const users = await auth0.users.getAll();
    // Filter out users without email or with placeholder emails if desired
    const filteredUsers = users.filter((user) => user.email && !user.email.includes('@placeholder.email'));
    return res.status(200).json(filteredUsers);
  } catch (error: any) {
    console.error('Error fetching users from Auth0:', error);
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const updateAuth0UserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body; // Asumimos que el rol se envía en el body de la petición

  if (!role) {
    return res.status(400).json({ message: 'Role is required.' });
  }

  try {
    // Obtener todos los roles disponibles desde Auth0
    const auth0Roles = await auth0.roles.getAll();

    // Buscar el ID del rol para el nombre de rol nuevo
    const newRole = auth0Roles.find((r) => r.name === role);

    if (!newRole) {
      return res.status(400).json({ message: `Role '${role}' not found in Auth0.` });
    }

    // Obtener roles existentes del usuario
    const existingRolesResponse = await auth0.users.getRoles({ id });
    const existingRoleIds = existingRolesResponse.data.map((r: any) => r.id);

    // Eliminar roles existentes del usuario
    if (existingRoleIds.length > 0) {
      await auth0.users.removeRoles({ id }, { roles: existingRoleIds });
    }

    // Añadir el nuevo rol al usuario
    if (newRole.id) {
      await auth0.users.assignRoles({ id }, { roles: [newRole.id] });
    }

    return res.status(200).json({ message: 'User role updated successfully.' });
  } catch (error: any) {
    console.error('Error updating user role in Auth0:', error);
    return res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};