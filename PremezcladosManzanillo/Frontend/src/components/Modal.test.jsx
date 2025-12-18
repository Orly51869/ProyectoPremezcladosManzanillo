import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Modal from './Modal';

describe('Modal Component', () => {
  it('should render the title and children', () => {
    render(
      <Modal title="Test Modal" onClose={() => {}}>
        <p>Modal Content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <Modal title="Test Modal" onClose={onCloseMock}>
        <p>Content</p>
      </Modal>
    );

    // El botón de cerrar tiene el icono X de lucide-react
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
