import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { prismaMock } from './helpers/prismaMock';

// Mock del logger para verificar los argumentos recibidos
vi.mock('../utils/auditLogger', () => ({
  logActivity: vi.fn().mockResolvedValue(true)
}));

import { logActivity } from '../utils/auditLogger';

// Mock de autenticación y aprovisionamiento personalizado para este test
vi.mock('../middleware/jwtCheck', () => ({
  jwtCheck: (req: any, res: any, next: any) => {
    req.auth = { payload: { sub: 'auth0|oswaldo-bello-id' } };
    next();
  }
}));

vi.mock('../middleware/userProvisioningMiddleware', () => ({
  userProvisioningMiddleware: (req: any, res: any, next: any) => {
    // Seteamos el nombre real corregido que queremos validar
    req.dbUser = { 
      id: 'auth0|oswaldo-bello-id', 
      name: 'Oswaldo Bello', 
      role: 'Administrador' 
    };
    req.auth.payload['https://premezcladomanzanillo.com/roles'] = ['Administrador'];
    next();
  }
}));

import app from '../app';

describe('Verificación de Identidad Real en Auditoría (Vitest)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe registrar "Oswaldo Bello" al aprobar un presupuesto', async () => {
    // 1. Simular datos en la base de datos (Usar 'PENDING' en lugar de 'PENDIENTE')
    prismaMock.budget.findUnique.mockResolvedValue({
      id: 'budget-123',
      status: 'PENDING',
      total: 1000
    } as any);

    prismaMock.budget.update.mockResolvedValue({
      id: 'budget-123',
      status: 'APROBADO'
    } as any);

    // 2. Ejecutar la acción
    const response = await request(app)
      .post('/api/budgets/budget-123/approve')
      .send();

    // 3. Validaciones
    expect(response.status).toBe(200);
    
    // VERIFICACIÓN CRÍTICA: ¿Se llamó a logActivity con el nombre de la base de datos?
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        userName: 'Oswaldo Bello', 
        action: 'APPROVE',
        entity: 'BUDGET'
      })
    );
  });

  it('Debe registrar "Oswaldo Bello" al crear un presupuesto', async () => {
    prismaMock.client.findUnique.mockResolvedValue({ id: 'client-1' } as any);
    prismaMock.product.findUnique.mockResolvedValue({ 
      id: 'p1', 
      name: 'Concreto Base', 
      price: 150 
    } as any);
    
    prismaMock.budget.create.mockResolvedValue({
      id: 'new-budget-id',
      title: 'Prueba Vitest'
    } as any);

    // Mañana para pasar la validación de fecha
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await request(app)
      .post('/api/budgets')
      .send({
        title: 'Presupuesto de Prueba',
        clientId: 'client-1',
        products: [{ productId: 'p1', quantity: 1, price: 100 }], // Productos requeridos
        observations: 'Prueba de auditoria', // Observaciones requeridas
        deliveryDate: tomorrow.toISOString() // Fecha requerida
      });

    expect(response.status).toBe(201);
    
    // Verificamos que se use el nombre real y no uno genérico
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        userName: 'Oswaldo Bello',
        entity: 'BUDGET'
      })
    );
  });
});
