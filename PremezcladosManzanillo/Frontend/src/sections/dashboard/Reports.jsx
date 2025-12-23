import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Wallet, 
  Truck, 
  Users, 
  ShoppingBag,
  MapPin,
  Calendar
} from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { 
  getDashboardStats, 
  getCommercialReports, 
  getAccountingReports, 
  getOperationalReports 
} from '../../utils/api';
import { useAuth0 } from '@auth0/auth0-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { generateReportPDF } from '../../utils/reportGenerator';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Reports = () => {
  const { user } = useAuth0();
  const [activeTab, setActiveTab] = useState('comercial');
  const [data, setData] = useState({
    commercial: null,
    accounting: null,
    operational: null,
    general: null
  });
  const [loading, setLoading] = useState(true);

  // Auto-selección de pestaña por rol
  useEffect(() => {
    const roles = (user?.['https://premezcladomanzanillo.com/roles'] || []).map(r => r.toLowerCase());
    if (roles.includes('contable')) setActiveTab('contabilidad');
    else if (roles.includes('operaciones')) setActiveTab('operaciones');
    else setActiveTab('comercial');
  }, [user]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [gen, com, acc, ope] = await Promise.all([
          getDashboardStats(),
          getCommercialReports(),
          getAccountingReports(),
          getOperationalReports()
        ]);
        setData({ general: gen, commercial: com, accounting: acc, operational: ope });
      } catch (err) {
        console.error("Error fetching reports data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleExport = (format) => {
    alert(`Generando reporte ${format.toUpperCase()}...`);
    if (format === 'pdf') {
       generateReportPDF(null, data.general, activeTab, user?.name || 'Usuario');
    }
  };

  if (loading) return <div className="text-center py-12 dark:text-gray-300">Construyendo análisis detallado...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-primary rounded-xl shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Centro de Inteligencia</h1>
            <p className="text-gray-500 dark:text-gray-400">Análisis y rendimiento de Premezclado Manzanillo</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 bg-white dark:bg-dark-primary border border-gray-200 dark:border-dark-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors">
            <Download className="w-4 h-4 text-brand-primary" /> PDF
          </button>
          <button onClick={() => handleExport('excel')} className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-mid transition-colors shadow-md">
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface p-1 rounded-xl mb-8 w-fit border border-gray-200 dark:border-dark-surface">
        <button 
          onClick={() => setActiveTab('comercial')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'comercial' ? 'bg-white dark:bg-dark-primary text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <TrendingUp className="w-4 h-4" /> Comercial
        </button>
        <button 
          onClick={() => setActiveTab('contabilidad')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'contabilidad' ? 'bg-white dark:bg-dark-primary text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Wallet className="w-4 h-4" /> Contabilidad
        </button>
        <button 
          onClick={() => setActiveTab('operaciones')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'operaciones' ? 'bg-white dark:bg-dark-primary text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Truck className="w-4 h-4" /> Operaciones
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'comercial' && <CommercialView data={data.commercial} />}
          {activeTab === 'contabilidad' && <AccountingView data={data.accounting} />}
          {activeTab === 'operaciones' && <OperationalView data={data.operational} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const CommercialView = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-surface">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="w-5 h-5 text-brand-primary" />
        <h3 className="text-xl font-bold dark:text-white">Top 5 Productos Vendidos</h3>
      </div>
      <div className="h-64">
        <Bar 
          data={{
            labels: data?.topProducts?.map(p => p.name) || [],
            datasets: [{
              label: 'Cantidad Vendida',
              data: data?.topProducts?.map(p => p.quantity) || [],
              backgroundColor: '#15803D',
              borderRadius: 8
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
              x: { grid: { display: false } }
            }
          }}
        />
      </div>
    </div>

    <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-surface">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-5 h-5 text-brand-primary" />
        <h3 className="text-xl font-bold dark:text-white">Top 5 Clientes (Ingresos)</h3>
      </div>
      <div className="space-y-4">
        {data?.topClients?.slice(0, 5).map((client, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs">
                {idx + 1}
              </div>
              <span className="font-medium dark:text-gray-200">{client.name}</span>
            </div>
            <div className="text-right">
              <p className="font-bold dark:text-white">{formatCurrency(client.totalAmount)}</p>
              <p className="text-xs text-gray-500">{client.budgetCount} presupuestos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AccountingView = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-surface">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-5 h-5 text-brand-primary" />
        <h3 className="text-xl font-bold dark:text-white">Ingresos por Tipo de Concreto</h3>
      </div>
      <div className="h-64 flex justify-center">
        <Pie 
          data={{
            labels: data?.revenueByType?.map(r => r.name) || [],
            datasets: [{
              data: data?.revenueByType?.map(r => r.value) || [],
              backgroundColor: ['#15803D', '#166534', '#14532D', '#052E16', '#22C55E'],
              borderWidth: 0
            }]
          }}
          options={{ maintainAspectRatio: false }}
        />
      </div>
    </div>

    <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-surface">
       <div className="flex items-center gap-3 mb-6">
        <Clock className="w-5 h-5 text-orange-500" />
        <h3 className="text-xl font-bold dark:text-white">Análisis de Cartera Pendiente</h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {data?.agingAnalysis?.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-gray-100 dark:border-dark-surface bg-gray-50/50 dark:bg-dark-surface/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${idx === 0 ? 'bg-green-100 text-green-700' : idx === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {idx === 0 ? 'Al día' : idx === 1 ? 'Vencido' : 'Crítico'}
              </span>
            </div>
            <p className="text-2xl font-bold dark:text-white">{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OperationalView = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-surface">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-5 h-5 text-brand-primary" />
        <h3 className="text-xl font-bold dark:text-white">Cronograma de Próximas Entregas</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 border-b border-gray-100 dark:border-dark-surface uppercase text-xs">
            <tr>
              <th className="pb-3 px-2">Fecha</th>
              <th className="pb-3">Cliente</th>
              <th className="pb-3">Dirección</th>
              <th className="pb-3 text-right">Volumen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-surface">
            {data?.deliveries?.map((d, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors">
                <td className="py-4 px-2 font-semibold text-brand-primary">{formatDate(d.date)}</td>
                <td className="py-4 dark:text-gray-200">{d.client}</td>
                <td className="py-4">
                  <div className="flex items-center gap-1 text-gray-500 italic max-w-xs truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" /> {d.address}
                  </div>
                </td>
                <td className="py-4 text-right font-bold dark:text-white">{d.volume} m³</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-surface">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-5 h-5 text-brand-primary" />
        <h3 className="text-xl font-bold dark:text-white">Concentración por Zona</h3>
      </div>
      <div className="space-y-4">
        {data?.zones?.map((zone, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{zone.name}</span>
              <span className="font-bold text-brand-primary">{zone.count} obras</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden">
               <div className="h-full bg-brand-primary" style={{ width: `${(zone.count / data.deliveries.length) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Reports;
