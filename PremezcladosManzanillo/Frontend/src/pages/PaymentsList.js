import React from 'react';
import { parse, formatRelative } from 'date-fns';
// Importa el locale en español si quieres que "yesterday" se muestre como "ayer"
import { es } from 'date-fns/locale';
import { MoreVertical } from 'lucide-react';

// El componente ahora recibe `payments` y otras funciones como props
const PaymentsList = ({ payments = [], onValidate, onResend, currentUser }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Pagado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Vencido': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Función para obtener el nombre del cliente de un presupuesto
  const getClientName = (budgetId) => {
    // En un futuro, esto vendría de un estado global o contexto
    const budget = { clientId: 'client-1', clientName: 'Cliente de Prueba' }; // Simulación
    return budget?.clientName || 'N/A';
  };

  // Define qué roles pueden validar
  const canValidate = currentUser && ["Tesorería", "Administrador"].includes(currentUser.role);

  return (
    <div className="bg-white dark:bg-dark-primary rounded-2xl p-4 shadow-lg border border-brand-light dark:border-dark-surface">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Pagos Recientes</h2>
        </div>
        <button type="button" className="text-brand-primary dark:text-brand-dark font-medium hover:underline">Ver todos</button>
      </div>
      <div className="overflow-x-auto">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {payments.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No hay pagos registrados.</p>
          ) : (
            payments.map((payment) => (
            <li key={payment.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface">
              <div className="flex items-center gap-3">
                {/* Podríamos usar un avatar genérico o el del cliente */}
                <div className="w-10 h-10 rounded-full bg-brand-light dark:bg-dark-surface flex items-center justify-center font-bold text-brand-primary">
                  {getClientName(payment.budgetId).charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{getClientName(payment.budgetId)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelative(parse(payment.date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", new Date()), new Date(), { locale: es })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold text-gray-800 dark:text-gray-200">${(payment.amount || 0).toFixed(2)}</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(payment.status)}`}>{payment.status}</span>
                <div className="relative">
                  {/* El botón de opciones ahora puede tener lógica */}
                  <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical size={20} />
                  </button>
                  {/* Aquí podrías agregar un menú desplegable */}
                  {payment.status === 'Pendiente' && canValidate && (
                    <button onClick={() => onValidate(payment.id)} className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">Validar</button>
                  )}
                  {payment.status === 'Rechazado' && canValidate && (
                     <button onClick={() => onResend(payment.id)} className="ml-2 text-xs bg-gray-500 text-white px-2 py-1 rounded">Reenviar</button>
                  )}
                </div>
              </div>
            </li>
          )))}
        </ul>
      </div>
    </div>
  );
};

export default PaymentsList;
