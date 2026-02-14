import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal.jsx'; // Generic Modal component

const PaymentValidationModal = ({ onClose, onSubmit, payment }) => {
  const [status, setStatus] = useState(payment.status || 'PENDING');
  const [observations, setObservations] = useState(payment.observations || '');

  const [fiscalInvoiceFile, setFiscalInvoiceFile] = useState(null);
  const [deliveryOrderFile, setDeliveryOrderFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setStatus(payment.status || 'PENDING');
    setObservations(payment.observations || '');
    // Reiniciar inputs de archivo cuando cambia el pago
    setFiscalInvoiceFile(null);
    setDeliveryOrderFile(null);
  }, [payment]);

  const validate = () => {
    const newErrors = {};
    if (status === 'REJECTED' && !observations.trim()) {
      newErrors.observations = 'Debe proporcionar una razón para el rechazo.';
    }
    // Agregar validación para subida de archivos si son requeridos según el estado
    // Por ahora, asumiendo opcionales.
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const formData = new FormData();
    formData.append('status', status);
    formData.append('observations', observations);
    if (fiscalInvoiceFile) formData.append('fiscalInvoice', fiscalInvoiceFile);
    if (deliveryOrderFile) formData.append('deliveryOrder', deliveryOrderFile);

    onSubmit(payment.id, formData);
    onClose();
  };

  return (
    <Modal onClose={onClose} title={`Validar Pago para Presupuesto: ${payment.budget?.title || payment.budgetId}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado del Pago</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-dark-surface dark:text-gray-200"
          >
            <option value="PENDING">PENDIENTE</option>
            <option value="VALIDATED">VALIDADO</option>
            <option value="REJECTED">RECHAZADO</option>
          </select>
        </div>

        {status === 'REJECTED' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo de Rechazo</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-dark-surface dark:text-gray-200"
              rows="3"
              placeholder="Ingrese el motivo por el cual se rechaza el pago."
            ></textarea>
            {errors.observations && <p className="text-red-500 text-xs mt-1">{errors.observations}</p>}
          </div>
        )}

        {status === 'VALIDATED' && (
          <div className="space-y-3">
            <p className="font-semibold text-gray-800 dark:text-gray-100">Documentos (Opcional)</p>
            {/* Factura Proforma eliminada a petición del usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Factura Fiscal (PDF)</label>
              <input type="file" accept="application/pdf" onChange={(e) => setFiscalInvoiceFile(e.target.files[0])} className="w-full text-sm dark:text-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orden de Entrega (PDF)</label>
              <input type="file" accept="application/pdf" onChange={(e) => setDeliveryOrderFile(e.target.files[0])} className="w-full text-sm dark:text-gray-300" />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md dark:bg-dark-surface dark:text-gray-200">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md">Guardar Cambios</button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentValidationModal;
