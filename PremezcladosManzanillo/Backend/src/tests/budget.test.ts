import { prismaMock } from './helpers/prismaMock';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// IMPORTANTE: Mockeamos los middlewares ANTES de importar app
vi.mock('../middleware/jwtCheck', () => ({
  jwtCheck: (req: any, res: any, next: any) => {
    // Simulamos un usuario autenticado por defecto
    req.auth = { payload: { sub: 'auth0|test-user-123' } };
    next();
  }
}));

vi.mock('../middleware/userProvisioningMiddleware', () => ({
  userProvisioningMiddleware: (req: any, res: any, next: any) => {
    req.dbUser = { id: 'auth0|test-user-123', role: req.headers['test-role'] || 'Usuario' };
    // Inyectamos el payload para el controlador que busca roles ahí
    req.auth.payload['https://premezcladomanzanillo.com/roles'] = [req.headers['test-role'] || 'Usuario'];
    next();
  }
}));

import app from '../app';

describe('Budgets API - Business Logic Tests', () => {

  it('GET /api/budgets should filter budgets by user owner (Role: Usuario)', async () => {
    const mockBudgets = [
      { id: 'b1', title: 'Mi Presupuesto', creatorId: 'auth0|test-user-123' }
    ];

    prismaMock.budget.findMany.mockResolvedValue(mockBudgets as any);

    const response = await request(app)
      .get('/api/budgets')
      .set('test-role', 'Usuario');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    // Verificamos que Prisma recibió el filtro de creatorId
    expect(prismaMock.budget.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { creatorId: 'auth0|test-user-123' }
    }));
  });

  it('GET /api/budgets should show all budgets for Administrator', async () => {
    prismaMock.budget.findMany.mockResolvedValue([]);

    await request(app)
      .get('/api/budgets')
      .set('test-role', 'Administrador');

    // Verificamos que para Admin NO se envió el filtro de creatorId (ve todos)
    const callArgs = (prismaMock.budget.findMany as any).mock.calls.find((call: any) => !call[0].where);
    expect(callArgs).toBeDefined();
  });

  it('POST /api/budgets should calculate total correctly', async () => {
    const mockProduct = { id: 'p1', price: 100 };
    const budgetData = {
      title: 'Obra 1',
      clientId: 'c1',
      observations: 'Test',
      products: [{ productId: 'p1', quantity: 5 }]
    };

    // Simulaciones necesarias para el controlador
    prismaMock.product.findUnique.mockResolvedValue(mockProduct as any);
    prismaMock.budget.create.mockResolvedValue({ id: 'new-b', total: 500 } as any);

    const response = await request(app)
      .post('/api/budgets')
      .send(budgetData)
      .set('test-role', 'Usuario');

    expect(response.status).toBe(201);
    // 5 unidades * 100 precio = 500 total
    expect(prismaMock.budget.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        total: 500
      })
    }));
  });

});
