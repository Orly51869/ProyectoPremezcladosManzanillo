import { Request, Response } from 'express';
import { logActivity } from '../utils/auditLogger';
import prisma from '../lib/prisma';

// Obtener clientes según el rol del usuario
export const getClientsByOwner = async (req: Request, res: Response) => {
  const ownerId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!ownerId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  try {
    let clients;
    const includeArgs = {
      owner: true, // Incluir detalles del propietario
      _count: {
        select: { budgets: true },
      },
    };

    if (roles.includes('Administrador') || roles.includes('Comercial')) {
      // Los Administradores y Comerciales pueden ver todos los clientes
      clients = await prisma.client.findMany({ include: includeArgs });
    } else {
      // Otros roles (p. ej., 'Usuario') solo pueden ver sus propios clientes
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

// Crear un nuevo cliente
export const createClient = async (req: Request, res: Response) => {
  const ownerId = req.auth?.payload.sub;
  const userName = (req.auth?.payload as any)?.name || 'Usuario';
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

    await logActivity({
      userId: ownerId,
      userName,
      action: 'CREATE',
      entity: 'CLIENT',
      entityId: newClient.id,
      details: `Cliente creado: ${name}`
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

// Actualizar un cliente existente
export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req.auth?.payload as any)?.name || 'Usuario';
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
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    // Comprobación de autorización
    const hasBudgets = existingClient._count.budgets > 0;
    const isOwner = existingClient.ownerId === authUserId;

    // Los roles privilegiados pueden hacer casi todo
    const canBeManagedByPrivileged = roles.includes('Administrador') || roles.includes('Contable');

    // Escenario 1: El cliente tiene presupuestos asociados
    if (hasBudgets) {
      if (!canBeManagedByPrivileged) {
        return res.status(403).json({ error: 'No puedes modificar este cliente porque ya tiene presupuestos asociados. Solo un Administrador o Contable puede hacerlo.' });
      }
    } 
    // Escenario 2: El cliente NO tiene presupuestos
    else {
      const canBeManagedByComercial = roles.includes('Comercial') && isOwner;
      const canBeManagedByUsuario = roles.includes('Usuario') && isOwner;

      if (!canBeManagedByPrivileged && !canBeManagedByComercial && !canBeManagedByUsuario) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este cliente.' });
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

    await logActivity({
      userId: authUserId,
      userName,
      action: 'UPDATE',
      entity: 'CLIENT',
      entityId: id,
      details: `Cliente actualizado: ${name}`
    });

    res.status(200).json(updatedClient);
  } catch (error) {
    console.error(`Error updating client with ID ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Eliminar un cliente
export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];
  const userName = (req.auth?.payload as any)?.name || 'Usuario';

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  try {
    const existingClient = await prisma.client.findUnique({
      where: { id: id },
      include: {
        budgets: {
          include: {
            payments: {
              include: {
                invoice: true,
              },
            },
            products: true,
          },
        },
        _count: {
          select: { budgets: true },
        },
      },
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    // Nueva lógica de autorización
    const hasBudgets = existingClient._count.budgets > 0;
    const isOwner = existingClient.ownerId === authUserId;
    const isAdmin = roles.includes('Administrador');
    const isContable = roles.includes('Contable');
    const isUsuario = roles.includes('Usuario');
    // Asumir que el rol 'Comercial' debe comportarse como 'Usuario' según la ambigüedad en la solicitud
    const isComercial = roles.includes('Comercial'); 

    let authorized = false;
    let errorMessage = 'No tienes permiso para eliminar este cliente.';

    if (isAdmin || isContable) {
      // Admin y Contable pueden eliminar sin restricciones
      authorized = true;
    } else if ((isUsuario || isComercial) && isOwner) {
      if (hasBudgets) {
        errorMessage = 'No puedes eliminar este cliente porque tiene presupuestos asociados. Solo un Administrador o Contable puede hacerlo.';
      } else {
        // Usuario/Comercial puede eliminar sus propios clientes si no tienen presupuestos
        authorized = true;
      }
    }

    if (!authorized) {
      return res.status(403).json({ error: errorMessage });
    }
    
    // Usar una transacción para asegurar que todos los registros relacionados se eliminen en el orden correcto
    await prisma.$transaction(async (tx) => {
      // Eliminar todas las facturas relacionadas con los pagos de los presupuestos de este cliente
      for (const budget of existingClient.budgets) {
        for (const payment of budget.payments) {
          if (payment.invoice) {
            await tx.invoice.delete({
              where: { id: payment.invoice.id },
            });
          }
        }
      }

      // Eliminar todos los pagos relacionados con los presupuestos de este cliente
      for (const budget of existingClient.budgets) {
        await tx.payment.deleteMany({
          where: { budgetId: budget.id },
        });
      }

      // Eliminar todos los productos de presupuesto relacionados con los presupuestos de este cliente
      for (const budget of existingClient.budgets) {
        await tx.budgetProduct.deleteMany({
          where: { budgetId: budget.id },
        });
      }

      // Eliminar todos los presupuestos relacionados con este cliente
      await tx.budget.deleteMany({
        where: { clientId: id },
      });

      // Finalmente, eliminar el cliente
      await tx.client.delete({
        where: { id: id },
      });
    });

    await logActivity({
      userId: authUserId as string,
      userName: userName,
      action: 'DELETE',
      entity: 'CLIENT',
      entityId: id,
      details: `Cliente eliminado: ${existingClient.name}`
    });

    res.status(204).send(); // No content for successful deletion
  } catch (error: any) {
    console.error(`Error deleting client with ID ${id}:`, error);
    
    // Handle Prisma foreign key constraint errors
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'No se puede eliminar el cliente porque tiene registros relacionados (presupuestos, pagos, etc.). Por favor, contacta a un administrador.' 
      });
    }
    
    // Handle other Prisma errors
    if (error.code && error.code.startsWith('P')) {
      return res.status(400).json({ 
        error: `Error al eliminar el cliente: ${error.message || 'Error de base de datos'}` 
      });
    }
    
    res.status(500).json({ error: 'Error interno del servidor al eliminar el cliente.' });
  }
};
