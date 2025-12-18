import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import CurrencyToggle from './CurrencyToggle';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth0 } from '@auth0/auth0-react';

// Mock de los hooks
vi.mock('../context/CurrencyContext');
vi.mock('@auth0/auth0-react');

describe('CurrencyToggle Component', () => {
  const mockToggleCurrency = vi.fn();
  const mockRefreshRates = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuración por defecto para el hook de moneda
    useCurrency.mockReturnValue({
      currency: 'USD',
      exchangeRate: 36.5,
      toggleCurrency: mockToggleCurrency,
      isManual: false,
      loading: false,
      refreshRates: mockRefreshRates
    });

    // Configuración por defecto para Auth0 (Usuario normal)
    useAuth0.mockReturnValue({
      user: { 'https://premezcladomanzanillo.com/roles': ['Usuario'] }
    });
  });

  it('should display the current exchange rate', () => {
    render(<CurrencyToggle />);
    expect(screen.getByText('36,50')).toBeInTheDocument();
  });

  it('should call toggleCurrency when clicked', () => {
    render(<CurrencyToggle />);
    const toggleContainer = screen.getByTitle('Cambiar moneda global');
    fireEvent.click(toggleContainer);
    expect(mockToggleCurrency).toHaveBeenCalledTimes(1);
  });

  it('should hidden edit button for regular users', () => {
    render(<CurrencyToggle />);
    const editButton = screen.queryByTitle('Editar Tasa Manualmente');
    expect(editButton).not.toBeInTheDocument();
  });

  it('should show edit button for Administrators', () => {
    // Cambiamos el mock para simular un Admin
    useAuth0.mockReturnValue({
      user: { 'https://premezcladomanzanillo.com/roles': ['Administrador'] }
    });

    render(<CurrencyToggle />);
    const editButton = screen.getByTitle('Editar Tasa Manualmente');
    expect(editButton).toBeInTheDocument();
  });
});
