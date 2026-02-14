import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import BudgetList from '../sections/dashboard/BudgetList';
import { FileText, ArrowLeft } from 'lucide-react';

const ClientBudgetsPage = () => {
  const { clientId } = useParams();
  const [budgets, setBudgets] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClientBudgets = useCallback(async () => {
    try {
      setLoading(true);
      // Obtener los presupuestos del cliente
      const budgetResponse = await api.get(`/api/clients/${clientId}/budgets`);
      setBudgets(budgetResponse.data);

      // Obtener detalles del cliente para mostrar el nombre
      // Podemos inferir detalles del cliente del primer presupuesto si existe
      if (budgetResponse.data.length > 0) {
        setClient(budgetResponse.data[0].client);
      } else {
        // Si no hay presupuestos, obtener detalles del cliente directamente
        const clientResponse = await api.get(`/api/clients`); // Asumiendo que existe un endpoint para obtener un cliente por ID
        const allClients = clientResponse.data.find(c => c.id === parseInt(clientId));
        setClient(allClients)
      }

    } catch (err) {
      setError('Failed to fetch client budgets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientBudgets();
  }, [fetchClientBudgets]);

  if (loading) {
    return <div className="p-6 text-center">Cargando presupuestos...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full p-6 dark:bg-dark-primary">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-black dark:text-green-400" />
          <div>
            <Link to="/dashboard/clients" className="flex items-center text-sm text-gray-500 hover:underline mb-1">
              <ArrowLeft size={16} className="mr-1" />
              Volver a Clientes
            </Link>
            <h1 className="text-3xl font-bold text-brand-primary dark:text-white">
              Presupuestos de {client ? client.name : 'Cliente'}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface">
        {budgets.length > 0 ? (
          <BudgetList
            budgets={budgets}
            viewMode="list"
            onEdit={() => { }} // Pass empty functions if edit/delete is not needed here
            onDelete={() => { }}
            onApprove={() => { }}
            onReject={() => { }}
            userRoles={[]} // Pass roles if needed for actions
            currentUserId={null}
            isClientSpecificPage={true} // Flag to hide client-related columns/filters
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Este cliente aún no tiene presupuestos registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBudgetsPage;
