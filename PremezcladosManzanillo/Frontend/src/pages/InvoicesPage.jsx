import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';
import { FileText, Download, Upload, X, Eye, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../components/Modal';

const InvoicesPage = () => {
  const { user } = useAuth0();
  const userRoles = user?.['https://premezcladomanzanillo.com/roles'] || [];

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [fiscalInvoiceFile, setFiscalInvoiceFile] = useState(null);
  const [deliveryOrderFile, setDeliveryOrderFile] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/invoices');
      setInvoices(response.data);
    } catch (err) {
      setError('Error al cargar facturas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const canUploadDocuments = userRoles.includes('Administrador') || userRoles.includes('Contable') || userRoles.includes('Operaciones');
  const isContable = userRoles.includes('Contable');
  const isOperaciones = userRoles.includes('Operaciones');
  const isAdminOrContable = userRoles.includes('Administrador') || userRoles.includes('Contable');

  const handleOpenUploadModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowUploadModal(true);
    setFiscalInvoiceFile(null);
    setDeliveryOrderFile(null);
    setUploadError(null);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedInvoice(null);
    setFiscalInvoiceFile(null);
    setDeliveryOrderFile(null);
    setUploadError(null);
  };

  const handleGenerateInvoice = () => {
    // Placeholder function for generating an invoice
    alert("Funcionalidad de generar factura en desarrollo.");
  };

  const handleUploadDocuments = async () => {
    if (!selectedInvoice) return;

    // Validation for Contable: both documents are required
    if (isContable && (!fiscalInvoiceFile || !deliveryOrderFile)) {
      setUploadError('Para el rol Contable, tanto la Factura Fiscal como la Orden de Entrega son obligatorias.');
      return;
    }

    // Validation: at least one document must be uploaded
    if (!fiscalInvoiceFile && !deliveryOrderFile) {
      setUploadError('Por favor, selecciona al menos un documento para subir.');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      if (fiscalInvoiceFile) {
        formData.append('fiscalInvoice', fiscalInvoiceFile);
      }
      if (deliveryOrderFile) {
        formData.append('deliveryOrder', deliveryOrderFile);
      }

      await api.patch(`/api/invoices/${selectedInvoice.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      handleCloseUploadModal();
      fetchInvoices(); // Refresh the list
    } catch (err) {
      console.error('Error uploading documents:', err);
      setUploadError(err.response?.data?.error || 'Error al subir los documentos. Por favor, inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center dark:text-white">Cargando facturas...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="w-full p-6 dark:bg-dark-primary">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-black dark:text-green-400" />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-white">Facturas</h1>
        </div>
        <button
          onClick={handleGenerateInvoice}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-mid transition-colors dark:bg-green-600 dark:hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Generar Factura
        </button>
      </div>

      <div className="bg-white dark:bg-dark-primary rounded-2xl shadow-lg border border-brand-light dark:border-dark-surface mb-6">
        {invoices.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-300 p-6">No hay facturas disponibles.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-light dark:divide-dark-surface">
              <thead className="dark:bg-dark-surface">
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <th scope="col" className="px-6 py-3">No. Factura</th>
                  <th scope="col" className="px-6 py-3">Presupuesto</th>
                  <th scope="col" className="px-6 py-3">Cliente</th>
                  <th scope="col" className="px-6 py-3">Estado</th>
                  <th scope="col" className="px-6 py-3">Generada</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-primary divide-y divide-brand-light dark:divide-dark-surface">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-primary dark:text-gray-100">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">
                      {invoice.payment?.budget?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">
                      {invoice.payment?.budget?.client?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'FISCAL_ISSUED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                        {invoice.status === 'PROFORMA' ? 'Proforma' : 'Fiscal Emitida'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">
                      {format(new Date(invoice.proformaGeneratedAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col gap-1 items-end">
                        {invoice.fiscalInvoiceUrl && (!isOperaciones || isAdminOrContable) && (
                          <div className="flex items-center gap-2 group">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">Factura</span>
                            <div className="flex gap-1">
                              <a
                                href={invoice.fiscalInvoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                title="Ver Factura Fiscal"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              <a
                                href={invoice.fiscalInvoiceUrl}
                                download
                                className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
                                title="Descargar Factura Fiscal"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}
                        {invoice.deliveryOrderUrl && (
                          <div className="flex items-center gap-2 group">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">Entrega</span>
                            <div className="flex gap-1">
                              <a
                                href={invoice.deliveryOrderUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                title="Ver Orden de Entrega"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              <a
                                href={invoice.deliveryOrderUrl}
                                download
                                className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
                                title="Descargar Orden de Entrega"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}
                        {/* Option to upload documents for Admin/Accountant - only show if status is PROFORMA or if documents are missing */}
                        <div className="flex gap-2 items-center mt-2">
                          {canUploadDocuments && (invoice.status === 'PROFORMA' || !invoice.fiscalInvoiceUrl || !invoice.deliveryOrderUrl) && (
                            <button
                              onClick={() => handleOpenUploadModal(invoice)}
                              className="text-brand-mid hover:text-brand-primary dark:text-green-400 dark:hover:text-green-300 transition-colors"
                              title="Subir documentos"
                            >
                              <Upload className="w-5 h-5" />
                            </button>
                          )}
                          {isAdminOrContable && (
                            <button
                              onClick={async () => {
                                if (window.confirm("¿Estás seguro de eliminar esta factura? Solo el registro se borrará.")) {
                                  try {
                                    await api.delete(`/api/invoices/${invoice.id}`);
                                    fetchInvoices();
                                  } catch (err) {
                                    alert("Error al eliminar la factura.");
                                  }
                                }
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Eliminar Factura (Admin)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para subir documentos */}
      {showUploadModal && selectedInvoice && (
        <Modal onClose={handleCloseUploadModal} title="Subir Documentos de Factura">
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-brand-text dark:text-gray-300 mb-2">
                Factura: <span className="font-semibold">{selectedInvoice.invoiceNumber}</span>
              </p>
              {isContable && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  <strong>Nota:</strong> Para el rol Contable, ambos documentos son obligatorios.
                </p>
              )}
            </div>

            {uploadError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {uploadError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-text dark:text-gray-300 mb-2">
                  Factura Fiscal {isContable && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFiscalInvoiceFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-brand-primary file:text-white
                    hover:file:bg-brand-mid
                    dark:file:bg-green-600 dark:hover:file:bg-green-700
                    file:cursor-pointer"
                />
                {selectedInvoice.fiscalInvoiceUrl && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Documento actual: <a href={selectedInvoice.fiscalInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Ver documento actual</a>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-text dark:text-gray-300 mb-2">
                  Orden de Entrega {isContable && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setDeliveryOrderFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-brand-primary file:text-white
                    hover:file:bg-brand-mid
                    dark:file:bg-green-600 dark:hover:file:bg-green-700
                    file:cursor-pointer"
                />
                {selectedInvoice.deliveryOrderUrl && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Documento actual: <a href={selectedInvoice.deliveryOrderUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Ver documento actual</a>
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseUploadModal}
                disabled={uploading}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadDocuments}
                disabled={uploading || (isContable && (!fiscalInvoiceFile || !deliveryOrderFile))}
                className="px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-mid dark:bg-green-600 dark:hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Subiendo...' : 'Subir Documentos'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InvoicesPage;
