import React from 'react';
import Modal from '../../components/Modal';
import BudgetForm from './BudgetForm';

const BudgetFormModal = ({ isEditing, initialValues, onSave, onCancel, userRoles }) => {
  const title = isEditing ? 'Editar Presupuesto' : 'Constructor de Presupuestos';

  return (
    <Modal onClose={onCancel} title={title} maxWidth="max-w-6xl">
      <BudgetForm
        initialValues={initialValues}
        onSave={onSave}
        onCancel={onCancel}
        userRoles={userRoles}
      />
    </Modal>
  );
};

export default BudgetFormModal;
