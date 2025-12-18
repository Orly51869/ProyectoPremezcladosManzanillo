import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import NotificationBell from './NotificationBell';
import api from '../utils/api';
import { useAuth0 } from '@auth0/auth0-react';

// Mock de dependencias
vi.mock('../utils/api');
vi.mock('@auth0/auth0-react');

describe('NotificationBell Component', () => {
  const mockNotifications = [
    { id: '1', message: 'Notificación 1', read: false, createdAt: new Date().toISOString() },
    { id: '2', message: 'Notificación 2', read: true, createdAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth0.mockReturnValue({
      user: { sub: 'auth0|test-user-123' }
    });
    // Por defecto, devolvemos las notificaciones mockeadas
    api.get.mockResolvedValue({ data: mockNotifications });
  });

  it('should render the bell icon and show unread count badge', async () => {
    render(<NotificationBell />);
    
    // Esperamos a que se carguen las notificaciones
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/notifications'));
    
    // Debería haber un badge con "1" (solo 1 no leída)
    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('should open the dropdown when clicked', async () => {
    render(<NotificationBell />);
    
    const bellButton = screen.getByRole('button', { name: /notificaciones/i });
    fireEvent.click(bellButton);

    // Esperar a que el título del dropdown y las notificaciones aparezcan
    expect(await screen.findByText('Notificaciones')).toBeInTheDocument();
    expect(await screen.findByText('Notificación 1')).toBeInTheDocument();
    expect(await screen.findByText('Notificación 2')).toBeInTheDocument();
  });

  it('should call the API to mark as read', async () => {
    api.patch.mockResolvedValue({ data: { ...mockNotifications[0], read: true } });
    
    render(<NotificationBell />);
    
    // Esperar a que el componente cargue inicialmente (por el badge)
    await screen.findByText('1');

    // Abrimos el dropdown
    const bellButton = screen.getByRole('button', { name: /notificaciones/i });
    fireEvent.click(bellButton);

    // Esperar a que el botón de marcar como leído esté disponible
    const markReadButton = await screen.findByTitle('Marcar como leído');
    fireEvent.click(markReadButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/api/notifications/1/read');
    });
  });

  it('should show "No hay notificaciones" when empty', async () => {
    api.get.mockResolvedValue({ data: [] });
    
    render(<NotificationBell />);
    
    const bellButton = screen.getByRole('button', { name: /notificaciones/i });
    fireEvent.click(bellButton);

    expect(await screen.findByText('No hay notificaciones.')).toBeInTheDocument();
  });
});
