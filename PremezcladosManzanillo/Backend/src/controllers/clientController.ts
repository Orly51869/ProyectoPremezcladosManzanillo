import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get clients based on user role
export const getClientsByOwner = async (req: Request, res: Response) => {
  const ownerId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!ownerId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  try {
    let clients;
    const includeArgs = {
      owner: true, // Include owner details
      _count: {
        select: { budgets: true },
      },
    };

    if (roles.includes('Administrador') || roles.includes('Comercial')) {
      // Admins and Commercials can see all clients
      clients = await prisma.client.findMany({ include: includeArgs });
    } else {
      // Other roles (e.g., 'Usuario') can only see their own clients
      clients = await prisma.client.findMany({
        where: { ownerId: ownerId },
        include: includeArgs,
      });
    }
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new client
export const createClient = async (req: Request, res: Response) => {
  const ownerId = req.auth?.payload.sub;
  if (!ownerId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  const { name, email, phone, address, rif } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required to create a client.' });
  }

  try {
    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        rif,
        owner: { connect: { id: ownerId } },
      },
    });
    res.status(201).json(newClient);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ error: 'Error: Ya existe un cliente con este correo electrónico.' });
    }
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an existing client
export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  const authUserId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required to update a client.' });
  }

  try {
    const existingClient = await prisma.client.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { budgets: true },
        },
      },
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    // Authorization check
    const hasBudgets = existingClient._count.budgets > 0;

    if (hasBudgets) {
      // If client has associated budgets, only Admin or Contable can update
      if (!roles.includes('Administrador') && !roles.includes('Contable')) {
        return res.status(403).json({ error: 'Forbidden: Client has associated budgets and you do not have permission to update it.' });
      }
    } else {
      // If client has no associated budgets, existing logic applies (Admin or Commercial as owner)
      if (!roles.includes('Administrador') && !(roles.includes('Comercial') && existingClient.ownerId === authUserId)) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to update this client.' });
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id: id },
      data: {
        name,
        email,
        phone,
        address,
      },
    });
    res.status(200).json(updatedClient);
  } catch (error) {
    console.error(`Error updating client with ID ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a client
export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  try {
    const existingClient = await prisma.client.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { budgets: true },
        },
      },
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    // Authorization check
    const hasBudgets = existingClient._count.budgets > 0;

    if (hasBudgets) {
      // If client has associated budgets, only Admin or Contable can delete
      if (!roles.includes('Administrador') && !roles.includes('Contable')) {
        return res.status(403).json({ error: 'Forbidden: Client has associated budgets and you do not have permission to delete it.' });
      }
    } else {
      // If client has no associated budgets, existing logic applies (Admin or Commercial as owner)
      if (!roles.includes('Administrador') && !(roles.includes('Comercial') && existingClient.ownerId === authUserId)) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this client.' });
      }
    }

    await prisma.client.delete({
      where: { id: id },
    });
    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error(`Error deleting client with ID ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
