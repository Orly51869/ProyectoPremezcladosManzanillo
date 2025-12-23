import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importar Link
import { DollarSign } from 'lucide-react'; // Importar icono
import { format } from 'date-fns';
import BudgetPDF from './BudgetPDF.jsx';

const formatDate = (value) => {
  if (!value) return '';
  if (typeof value === 'string') {
    if (value.length >= 10 && /\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    const d = new Date(value);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return value;
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') {
    const d = new Date(value);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return String(value);
  }
  try {
    const d = new Date(value);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
  } catch (e) {}
  return '';
};

const BudgetDetail = ({ budget, onClose = () => {}, userRoles = [], onApprove }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!budget) return null;

  // Mapeo de campos del backend (en inglés) a español para la UI
  const project = {
    nombreProyecto: budget.title || '',
    direccion: budget.address || '',
    fechaColado: budget.deliveryDate ? formatDate(budget.deliveryDate) : '',
    tipoObra: budget.workType || '',
    resistencia: budget.resistance || '',
    tipoConcreto: budget.concreteType || '',
    volumen: budget.volume ?? '',
    elemento: budget.element || '',
    requiereBomba: budget.pumpRequired ? 'Sí' : (budget.pumpRequired === false ? 'No' : ''),
    observaciones: budget.observations || '',
  };

  const fechaColado = project.fechaColado || formatDate(budget.createdAt);

  // Lógica para mostrar/ocultar botón de aprobación
  const canApprove = userRoles.includes('Administrador') || userRoles.includes('Contable');
  const showApproveButton = canApprove && budget.status === 'PENDING';

  console.log('Inspeccionando presupuesto en BudgetDetail:', budget);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-dark-primary rounded-xl shadow-lg border border-gray-200 dark:border-dark-surface overflow-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-300">{budget.title || project.nombreProyecto || 'Presupuesto'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Folio: {budget.folio || budget.id}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Estado: {budget.status}</p> {/* Mostrar el estado */}
            </div>

            <div className="flex gap-2">
              {/* Acciones principales ahora están en el área inferior: duplicar/convertir moved abajo */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-300 mb-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Datos del proyecto</h4>
              <div className="space-y-2">
                <div><span className="font-medium">Nombre:</span> {project.nombreProyecto || <span className="text-gray-400 italic">No especificado</span>}</div>
                <div><span className="font-medium">Dirección:</span> {project.direccion || <span className="text-gray-400 italic">No especificada</span>}</div>
                <div><span className="font-medium">Fecha estimada de colado:</span> {fechaColado || <span className="text-gray-400 italic">Pendiente por definir</span>}</div>
                <div><span className="font-medium">Tipo de obra:</span> {project.tipoObra || <span className="text-gray-400 italic">No especificado</span>}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Especificaciones del concreto</h4>
                <div className="space-y-2">
                  <div><span className="font-medium">Resistencia (f’c):</span> {project.resistencia || <span className="text-gray-400 italic">No especificada</span>}</div>
                  <div><span className="font-medium">Tipo de concreto:</span> {project.tipoConcreto || <span className="text-gray-400 italic">No especificado</span>}</div>
                  <div><span className="font-medium">Volumen (m³):</span> {project.volumen !== '' ? project.volumen : <span className="text-gray-400 italic">—</span>}</div>
                  <div><span className="font-medium">Elemento a colar:</span> {project.elemento || <span className="text-gray-400 italic">No especificado</span>}</div>
                  <div><span className="font-medium">Requiere bomba:</span> {project.requiereBomba || <span className="text-gray-400 italic">No especificado</span>}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <h4 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">Vencimiento</h4>
                {canApprove && (budget.status === 'PENDING' || budget.status === 'APPROVED') ? (
                  <div className="space-y-1">
                    <input 
                      type="date"
                      defaultValue={budget.validUntil ? formatDate(budget.validUntil) : ''}
                      onChange={async (e) => {
                        try {
                          await api.put(`/api/budgets/${budget.id}`, { validUntil: e.target.value });
                          alert('Fecha de vencimiento actualizada correctamente.');
                        } catch (err) {
                          alert('Error al actualizar la fecha.');
                        }
                      }}
                      className="w-full p-2 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-md text-xs font-bold"
                    />
                    <p className="text-[10px] text-gray-500 italic">Ajuste opcional por gerencia.</p>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {budget.validUntil ? format(new Date(budget.validUntil), 'dd/MM/yyyy') : 'No definida'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Observaciones</h4>
            <div className="text-sm text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-dark-surface p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                {project.observaciones ? project.observaciones : <span className="text-gray-400 italic">Sin observaciones registradas.</span>}
            </div>
          </div>

          <div className="flex justify-end mt-5 gap-2 items-center">
            {showApproveButton && (
              <button
                onClick={() => onApprove(budget.id)}
                className="px-4 py-2 rounded-md bg-green-600 text-white border border-green-700 text-sm hover:bg-green-700 transition duration-150"
              >
                Aprobar Presupuesto
              </button>
            )}
            {budget.status === 'APPROVED' && (
              <Link
                to={`/payments?budgetId=${budget.id}`}
                onClick={onClose} // Cerrar el modal al navegar
                className="px-4 py-2 rounded-md bg-blue-600 text-white border border-blue-700 text-sm hover:bg-blue-700 transition duration-150 flex items-center gap-1"
              >
                <DollarSign size={16} /> Ver/Registrar Pagos
              </Link>
            )}
            <BudgetPDF budget={budget} client={budget.client} className="ml-1" />
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-sm">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetail;