import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import axios from 'axios';

import { clearCurrencyCache } from '../controllers/currencyController';

// Mock de axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, { deep: true });

describe('Currency API - Functional Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    clearCurrencyCache();
  });

  it('GET /api/currency should return exchange rates from scraping', async () => {
    // Simulamos el HTML que devolvería el BCV
    const mockHtml = `
      <div id="dolar"><strong> 36,50 </strong></div>
      <div id="euro"><strong> 39,20 </strong></div>
    `;

    mockedAxios.get.mockResolvedValue({ data: mockHtml });

    const response = await request(app).get('/api/currency/rates');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      USD: 36.5,
      EUR: 39.2
    });
  });

  it('Should handle BCV errors and return 500 if no cache', async () => {
    mockedAxios.get.mockRejectedValue(new Error('BCV Down'));

    const response = await request(app).get('/api/currency/rates');

    expect(response.status).toBe(500);
  });

});
