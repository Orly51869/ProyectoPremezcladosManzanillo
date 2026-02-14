import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useUserRoles from '../../hooks/useUserRoles';
import {
  BarChart3,
  Download,
  TrendingUp,
  Wallet,
  Truck,
  Users,
  ShoppingBag,
  MapPin,
  Calendar,
  Clock
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
  getAccountingReports
} from '../../utils/api';
import { useAuth0 } from '@auth0/auth0-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { generateReportPDF } from '../../utils/reportGenerator';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Reports = () => {
  const { user } = useAuth0();
  const { rawRoles: userRoles } = useUserRoles();
  const [activeTab, setActiveTab] = useState('comercial');
  const [data, setData] = useState({
    commercial: null,
    accounting: null,
    operational: null,
    general: null
  });
  const [loading, setLoading] = useState(true);

  // Date Range State
  const [dateRange, setDateRange] = useState('all');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });

  // Determinar qué tabs puede ver cada rol
  // Administrador: ambos tabs | Contable: solo Contabilidad | Comercial: solo Comercial
  const canViewAccounting = userRoles.includes('Administrador') || userRoles.includes('Contable');
  const canViewCommercial = userRoles.includes('Administrador') || userRoles.includes('Comercial');

  // Auto-selección de pestaña por rol
  useEffect(() => {
    if (userRoles.includes('Contable') && !userRoles.includes('Administrador')) {
      setActiveTab('contabilidad');
    } else {
      setActiveTab('comercial');
    }
  }, [userRoles]);

  const getDateParams = () => {
    const now = new Date();
    let start, end;

    switch (dateRange) {
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'last_3_months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'last_6_months':
        start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'year_to_date':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date();
        break;
      case 'custom':
        if (customDates.start && customDates.end) {
          start = new Date(customDates.start);
          start.setHours(0, 0, 0, 0);
          end = new Date(customDates.end);
          end.setHours(23, 59, 59, 999);
        }
        break;
      default:
        // 'all' - no filter
        return {};
    }

    if (start && end) {
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    return {};
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const params = getDateParams();

        // Si personalizado está seleccionado pero faltan fechas, no obtener o obtener todo?
        if (dateRange === 'custom' && (!customDates.start || !customDates.end)) {
          setLoading(false);
          return;
        }

        const [gen, com, acc] = await Promise.all([
          getDashboardStats(params),
          getCommercialReports(params),
          getAccountingReports(params)
        ]);
        setData({ general: gen, commercial: com, accounting: acc });
      } catch (err) {
        console.error("Error fetching reports data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [dateRange, customDates]);

  const rangeLabels = {
    all: 'Todo el Historial',
    last_month: 'Último Mes',
    last_3_months: 'Últimos 3 Meses',
    last_6_months: 'Últimos 6 Meses',
    year_to_date: 'Este Año (YTD)',
    custom: 'Rango Personalizado'
  };

  const handleExport = (format) => {
    alert(`Generando reporte ${format.toUpperCase()}...`);
    if (format === 'pdf') {
      let specificData = null;
      if (activeTab === 'comercial') specificData = data.commercial;
      else if (activeTab === 'contabilidad') specificData = data.accounting;

      let dateText = rangeLabels[dateRange] || dateRange;
      if (dateRange === 'custom' && customDates.start && customDates.end) {
        dateText = `${customDates.start} al ${customDates.end}`;
      }

      generateReportPDF(specificData, data.general, activeTab, user?.name || 'Usuario', dateText);
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

        <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
          {/* DATE RANGE SELECTOR */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white dark:bg-dark-primary border border-gray-200 dark:border-dark-surface rounded-lg px-3 py-2 text-sm font-medium dark:text-white focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">Todo el Historial</option>
            <option value="last_month">Último Mes</option>
            <option value="last_3_months">Últimos 3 Meses</option>
            <option value="last_6_months">Últimos 6 Meses</option>
            <option value="year_to_date">Este Año (YTD)</option>
            <option value="custom">Rango Personalizado</option>
          </select>

          {dateRange === 'custom' && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={customDates.start}
                onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                className="bg-white dark:bg-dark-primary border border-gray-200 dark:border-dark-surface rounded-lg px-2 py-2 text-sm dark:text-white"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                className="bg-white dark:bg-dark-primary border border-gray-200 dark:border-dark-surface rounded-lg px-2 py-2 text-sm dark:text-white"
              />
            </div>
          )}

          <div className="flex gap-2 ml-2">
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 bg-white dark:bg-dark-primary border border-gray-200 dark:border-dark-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors">
              <Download className="w-4 h-4 text-brand-primary" /> PDF
            </button>
            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-mid transition-colors shadow-md">
              <Download className="w-4 h-4" /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs - Visibilidad controlada por rol */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface p-1 rounded-xl mb-8 w-fit border border-gray-200 dark:border-dark-surface">
        {/* Tab Comercial: visible para Administrador y Comercial */}
        {canViewCommercial && (
          <button
            onClick={() => setActiveTab('comercial')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'comercial' ? 'bg-white dark:bg-dark-primary text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <TrendingUp className="w-4 h-4" /> Comercial
          </button>
        )}
        {/* Tab Contabilidad: visible para Administrador y Contable */}
        {canViewAccounting && (
          <button
            onClick={() => setActiveTab('contabilidad')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'contabilidad' ? 'bg-white dark:bg-dark-primary text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Wallet className="w-4 h-4" /> Contabilidad
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'comercial' && canViewCommercial && <CommercialView data={data.commercial} />}
          {activeTab === 'contabilidad' && canViewAccounting && <AccountingView data={data.accounting} />}

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
