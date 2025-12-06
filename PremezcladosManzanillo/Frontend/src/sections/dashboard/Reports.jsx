import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

import { mockPayments } from '../../mock/data';
import { formatCurrency } from '../../utils/helpers';

const Reports = () => {
  const totalIncome = mockPayments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPending = mockPayments.reduce((sum, p) => sum + p.pending, 0);

  const pieData = {
    labels: ['Pagado', 'Pendiente'],
    datasets: [
      {
        data: [totalIncome, totalPending],
        backgroundColor: ['rgb(34, 197, 94)', 'rgb(251, 191, 36)'],
        borderColor: [document.body.classList.contains('dark') ? '#1A362C' : '#FFFFFF'],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: document.body.classList.contains('dark') ? '#F9FAFB' : '#333' } },
      title: { display: true, text: 'Distribución de Pagos', color: document.body.classList.contains('dark') ? '#F9FAFB' : '#333' },
    },
  };

  const handleExport = (format) => {
    alert(`Exportando reportes en ${format.toUpperCase()}... (simulado)`);
  };

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
              <span className="text-brand-text dark:text-gray-300">Comprobantes Generados:</span>
              <span className="font-bold dark:text-gray-100">{mockPayments.length}</span>
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