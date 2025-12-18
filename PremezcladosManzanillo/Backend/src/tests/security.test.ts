import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

// Mockeamos el middleware de Auth0 para que no intente validar tokens reales durante los tests básicos
// o simplemente probamos que sin cabecera falle.
describe('Security Tests - RBAC & Auth', () => {

  it('Should return 401 when accessing protected route without token', async () => {
    const response = await request(app).get('/api/budgets');
    if (response.status !== 401) console.log('Response Body:', response.body);
    expect(response.status).toBe(401);
  });

  it('Should return 401 when accessing clients without token', async () => {
    const response = await request(app).get('/api/clients');
    if (response.status !== 401) console.log('Response Body:', response.body);
    expect(response.status).toBe(401);
  });

  it('Public route /api/settings should be accessible (GET)', async () => {
    const response = await request(app).get('/api/settings');
    // Esperamos 200 porque es pública (o al menos no 401 por Auth0)
    expect([200, 404]).toContain(response.status); 
  });

  it('Protected route /api/settings should return 401 on POST without token', async () => {
    const response = await request(app).post('/api/settings').send({ key: 'test', value: 'test' });
    if (response.status !== 401) console.log('Response Body:', response.body);
    expect(response.status).toBe(401);
  });

});
