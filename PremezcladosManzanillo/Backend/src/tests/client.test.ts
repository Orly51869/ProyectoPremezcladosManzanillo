import { prismaMock } from './helpers/prismaMock';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mockeamos los middlewares
vi.mock('../middleware/jwtCheck', () => ({
  jwtCheck: (req: any, res: any, next: any) => {
    req.auth = { payload: { sub: 'auth0|test-user-1' } };
    next();
  }
}));

vi.mock('../middleware/userProvisioningMiddleware', () => ({
  userProvisioningMiddleware: (req: any, res: any, next: any) => {
    req.dbUser = { id: 'auth0|test-user-1', role: req.headers['test-role'] || 'Usuario' };
    req.auth.payload['https://premezcladomanzanillo.com/roles'] = [req.headers['test-role'] || 'Usuario'];
    next();
  }
}));

import app from '../app';

describe('Clients API - Functional Tests', () => {

  it('GET /api/clients should return all clients for Admin', async () => {
    prismaMock.client.findMany.mockResolvedValue([
      { id: 'c1', name: 'Cliente A', ownerId: 'auth0|test-user-1' },
      { id: 'c2', name: 'Cliente B', ownerId: 'other-user' }
    ] as any);

    const response = await request(app)
      .get('/api/clients')
      .set('test-role', 'Administrador');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('GET /api/clients should return only owned clients for Usuario', async () => {
    prismaMock.client.findMany.mockResolvedValue([
      { id: 'c1', name: 'Cliente A', ownerId: 'auth0|test-user-1' }
    ] as any);

    const response = await request(app)
      .get('/api/clients')
      .set('test-role', 'Usuario');

    expect(response.status).toBe(200);
    expect(prismaMock.client.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { ownerId: 'auth0|test-user-1' }
    }));
  });

  it('DELETE /api/clients/:id should fail for owner if client has budgets', async () => {
    const mockClientWithBudgets = {
      id: 'c1',
      ownerId: 'auth0|test-user-1',
      _count: { budgets: 5 }
    };

    prismaMock.client.findUnique.mockResolvedValue(mockClientWithBudgets as any);

    const response = await request(app)
      .delete('/api/clients/c1')
      .set('test-role', 'Usuario');

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('tiene presupuestos asociados');
  });

  it('DELETE /api/clients/:id should allow Admin to delete even with budgets', async () => {
    const mockClientWithBudgets = {
      id: 'c1',
      name: 'Cliente Test',
      ownerId: 'auth0|test-user-1',
      budgets: [], // Simplificamos para el test
      _count: { budgets: 1 }
    };

    prismaMock.client.findUnique.mockResolvedValue(mockClientWithBudgets as any);
    // Simulamos éxito de la transacción
    prismaMock.$transaction.mockResolvedValue({} as any);

    const response = await request(app)
      .delete('/api/clients/c1')
      .set('test-role', 'Administrador');

    expect(response.status).toBe(204);
  });

});
