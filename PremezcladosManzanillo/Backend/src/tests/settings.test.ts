import { prismaMock } from './helpers/prismaMock';
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Settings API - Functional Tests', () => {

  it('GET /api/settings should return a map of settings', async () => {
    // Definimos el comportamiento del mock
    const mockSettings = [
      { key: 'companyName', value: 'Premezclados Manzanillo', type: 'text', createdAt: new Date(), updatedAt: new Date() },
      { key: 'ivaRate', value: '16', type: 'number', createdAt: new Date(), updatedAt: new Date() }
    ];

    prismaMock.setting.findMany.mockResolvedValue(mockSettings as any);

    const response = await request(app).get('/api/settings');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      companyName: 'Premezclados Manzanillo',
      ivaRate: '16'
    });
    
    // Verificamos que se llamó a Prisma
    expect(prismaMock.setting.findMany).toHaveBeenCalled();
  });

  it('GET /api/settings/:key should return a specific setting', async () => {
    const mockSetting = { key: 'testKey', value: 'testValue', type: 'text', createdAt: new Date(), updatedAt: new Date() };
    
    prismaMock.setting.findUnique.mockResolvedValue(mockSetting as any);

    const response = await request(app).get('/api/settings/testKey');

    expect(response.status).toBe(200);
    expect(response.body.value).toBe('testValue');
    expect(prismaMock.setting.findUnique).toHaveBeenCalledWith({
      where: { key: 'testKey' }
    });
  });

  it('GET /api/settings/:key should return 404 if not found', async () => {
    prismaMock.setting.findUnique.mockResolvedValue(null);

    const response = await request(app).get('/api/settings/nonExistent');

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

});
