import { prismaMock } from './helpers/prismaMock';
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../middleware/jwtCheck', () => ({
  jwtCheck: (req: any, res: any, next: any) => {
    req.auth = { payload: { sub: 'auth0|admin-user' } };
    next();
  }
}));

vi.mock('../middleware/userProvisioningMiddleware', () => ({
  userProvisioningMiddleware: (req: any, res: any, next: any) => {
    req.dbUser = { id: 'auth0|admin-user', role: req.headers['test-role'] || 'Administrador' };
    req.auth.payload['https://premezcladomanzanillo.com/roles'] = [req.headers['test-role'] || 'Administrador'];
    next();
  }
}));

import app from '../app';

describe('Audit API - Functional Tests', () => {

  it('GET /api/audit should be restricted to Administrators', async () => {
    const response = await request(app)
      .get('/api/audit')
      .set('test-role', 'Usuario');

    expect(response.status).toBe(403);
  });

  it('GET /api/audit should return logs for Administrator', async () => {
    prismaMock.auditLog.findMany.mockResolvedValue([
      { id: '1', action: 'CREATE', entity: 'BUDGET', userName: 'Test User', createdAt: new Date() }
    ] as any);

    const response = await request(app)
      .get('/api/audit')
      .set('test-role', 'Administrador');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].action).toBe('CREATE');
  });

});
