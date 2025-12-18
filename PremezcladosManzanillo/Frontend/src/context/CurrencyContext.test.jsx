import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { CurrencyProvider, useCurrency } from './CurrencyContext';
import * as api from '../utils/api';

// Mock de la utilidad de API
vi.mock('../utils/api', () => ({
  getExchangeRates: vi.fn()
}));

// Componente de prueba para consumir el contexto
const TestComponent = () => {
  const { currency, exchangeRate, toggleCurrency, formatPrice, updateRateManual } = useCurrency();
  return (
    <div>
      <span data-testid="currency">{currency}</span>
      <span data-testid="rate">{exchangeRate}</span>
      <span data-testid="formatted">{formatPrice(100)}</span>
      <button onClick={toggleCurrency}>Toggle</button>
      <button onClick={() => updateRateManual(50)}>SetManual</button>
    </div>
  );
};

describe('CurrencyContext Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getExchangeRates.mockResolvedValue({ USD: 36.5 });
  });

  it('should provide default USD currency and fetch rate on mount', async () => {
    await act(async () => {
      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );
    });

    expect(screen.getByTestId('currency').textContent).toBe('USD');
    expect(screen.getByTestId('rate').textContent).toBe('36.5');
    // En USD, 100 -> $100.00
    expect(screen.getByTestId('formatted').textContent).toContain('$100.00');
  });

  it('should toggle currency to VES and format correctly', async () => {
    await act(async () => {
      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );
    });

    const toggleBtn = screen.getByText('Toggle');
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByTestId('currency').textContent).toBe('VES');
    // 100 USD * 36.5 rate = 3650.00 VES
    // El formato local de Venezuela suele usar punto para miles y coma para decimales
    const formattedText = screen.getByTestId('formatted').textContent;
    expect(formattedText).toContain('3.650,00');
    expect(formattedText).toContain('Bs');
  });

  it('should allow manual rate update', async () => {
    await act(async () => {
      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );
    });

    const manualBtn = screen.getByText('SetManual');
    await act(async () => {
      fireEvent.click(manualBtn);
    });

    expect(screen.getByTestId('rate').textContent).toBe('50');
    // Ahora 100 USD * 50 rate = 5000 VES (si cambiamos a VES)
  });
});

// Nota: Importamos fireEvent de testing-library
import { fireEvent } from '@testing-library/react';
