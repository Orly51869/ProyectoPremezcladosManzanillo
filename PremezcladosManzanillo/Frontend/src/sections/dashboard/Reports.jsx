import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { getDashboardStats } from '../../utils/api';
import { useAuth0 } from '@auth0/auth0-react'; // Import useAuth0 if user details are needed for roles

ChartJS.register(ArcElement, Tooltip, Legend);

import { generateReportPDF } from '../../utils/reportGenerator';
import { formatCurrency } from '../../utils/helpers';

const Reports = () => {
  const { isAuthenticated, user } = useAuth0();
  const userRoles = user?.['https://premezcladomanzanillo.com/roles'] || [];
  const primaryRole = userRoles.includes('Administrador') ? 'Administrador' : 
                      userRoles.includes('Contable') ? 'Contable' :
                      userRoles.includes('Comercial') ? 'Comercial' : 'Usuario';

  const [reportStats, setReportStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const stats = await getDashboardStats();
        setReportStats(stats);
      } catch (err) {
        setError("Error al cargar los datos del reporte.");
        console.error("Report data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalIncome = reportStats?.totalIncome || 0;
  const totalPending = reportStats?.pendingAmount || 0;
  const totalPaymentsMade = reportStats?.totalPayments || 0;


  const pieData = useMemo(() => ({
    labels: ['Pagado', 'Pendiente'],
    datasets: [
      {
        data: [totalIncome, totalPending],
        backgroundColor: ['rgb(34, 197, 94)', 'rgb(251, 191, 36)'],
        borderColor: [document.body.classList.contains('dark') ? '#1A362C' : '#FFFFFF'],
        borderWidth: 2,
      },
    ],
  }), [totalIncome, totalPending]);

  const pieOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: document.body.classList.contains('dark') ? '#F9FAFB' : '#333' } },
      title: { display: true, text: 'Distribución de Pagos', color: document.body.classList.contains('dark') ? '#F9FAFB' : '#333' },
    },
  }), []);

  const handleExport = (format) => {
    if (format === 'pdf') {
      generateReportPDF(null, reportStats, primaryRole, user?.name || 'Usuario');
    } else {
      alert(`Exportación en ${format.toUpperCase()} no disponible por el momento.`);
    }
  };

  if (loading) {
    return <div className="text-center py-8 dark:text-gray-200">Cargando datos del reporte...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
        <BarChart3 className="w-8 h-8 text-black dark:text-green-400" />
        <h1 className="text-3xl font-bold text-brand-primary dark:text-white">Reportes Financieros</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface">
          <h3 className="text-xl font-bold text-brand-primary dark:text-gray-100 mb-4">Resumen General</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-brand-text dark:text-gray-300">Total Ingresos:</span>
              <span className="font-bold text-brand-primary dark:text-green-400">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text dark:text-gray-300">Total Pendiente:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalPending)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text dark:text-gray-300">Pagos Realizados:</span>
              <span className="font-bold dark:text-gray-100">{totalPaymentsMade}</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface">
          <Pie data={pieData} options={pieOptions} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-brand-primary dark:text-gray-100">Opciones de Exportación</h3>
          <div className="flex gap-4">
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-mid">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-mid">
              <Download className="w-4 h-4" /> Excel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;