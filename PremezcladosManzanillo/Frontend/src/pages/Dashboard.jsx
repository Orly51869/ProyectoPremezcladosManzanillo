import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  Check,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth0 } from "@auth0/auth0-react";
import { getDashboardStats, getRecentActivity } from "../utils/api"; // Importar nuevas funciones API

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import { formatDate, formatCurrency } from "../utils/helpers";

const Dashboard = () => {
  const { user } = useAuth0();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentActivityList, setRecentActivityList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const stats = await getDashboardStats();
        setDashboardStats(stats);
        const activity = await getRecentActivity();
        setRecentActivityList(activity);
      } catch (err) {
        setError("Error al cargar los datos del dashboard.");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalClients = dashboardStats?.totalClients || 0;
  const totalBudgets = dashboardStats?.totalBudgets || 0;
  const totalIncome = dashboardStats?.totalIncome || 0;
  const pending = dashboardStats?.pendingAmount || 0;
  const approvedBudgetsCount = dashboardStats?.approvedBudgets || 0;
  const totalPaymentsCount = dashboardStats?.totalPayments || 0;
  const pendingPaymentsCount = dashboardStats?.pendingPaymentsCount || 0;

  const labels = useMemo(() => dashboardStats?.chartData?.labels || ["Ene", "Feb", "Mar", "Abr", "May", "Jun"], [dashboardStats]);
  const ingresosSeries = useMemo(
    () => dashboardStats?.chartData?.ingresosSeries || [0, 0, 0, 0, 0, 0],
    [dashboardStats]
  );
  const pendientesSeries = useMemo(() => dashboardStats?.chartData?.pendientesSeries || [0, 0, 0, 0, 0, 0], [dashboardStats]);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Ingresos",
          data: ingresosSeries,
          borderColor: "#15803D",
          backgroundColor: "rgba(21,128,61,0.08)",
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: "Pagos pendientes",
          data: pendientesSeries,
          borderColor: "#064E3B",
          backgroundColor: "rgba(6,78,59,0.06)",
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    }),
    [labels, ingresosSeries, pendientesSeries]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { position: "top", labels: { color: document.body.classList.contains('dark') ? '#F9FAFB' : '#333' } },
        title: { display: true, text: "Ingresos vs Pagos pendientes", color: document.body.classList.contains('dark') ? '#F9FAFB' : '#333' },
        tooltip: { mode: "index", intersect: false },
      },
      interaction: { mode: "nearest", intersect: false },
      scales: {
        x: { ticks: { color: document.body.classList.contains('dark') ? '#F9FAFB' : '#333' } },
        y: { ticks: { color: document.body.classList.contains('dark') ? '#F9FAFB' : '#333' } },
      }
    }),
    []
  );

  // Considerar que el cálculo del crecimiento porcentual es más complejo y podría requerir datos históricos.
  // Por ahora, se mantendrá estático o se removerá si no hay una fuente clara de datos.
  const growthPercent = 0; // Mantener estático o remover si no hay datos.

  if (loading) {
    return <div className="text-center py-8 dark:text-gray-200">Cargando datos del dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 relative">
        <div className="bg-white/60 dark:bg-dark-primary/60 backdrop-blur-sm rounded-b-xl p-4 mb-6 border border-brand-light dark:border-dark-surface">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm text-brand-text dark:text-gray-300">
                {formatDate(new Date())} • Bienvenido,{" "}
                <span className="font-medium">{user?.name || "Usuario"}</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-brand-text dark:text-gray-300">Panel</p>
              <p className="text-xs text-brand-text dark:text-gray-400">Resumen ejecutivo</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto mb-6 sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-primary rounded-2xl p-4 shadow-soft border border-brand-light dark:border-dark-surface"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                  <Users className="w-6 h-6 text-brand-dark dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-brand-text dark:text-gray-300">Clientes</p>
                  <p className="text-2xl font-bold text-brand-dark dark:text-gray-100">
                    {totalClients}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`inline-flex items-center gap-1 text-sm text-gray-500`}>
                  <span>{growthPercent}%</span>
                </div>
                <p className="text-xs text-brand-text dark:text-gray-400">vs mes anterior</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-dark-primary rounded-2xl p-4 shadow-soft border border-brand-light dark:border-dark-surface"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                  <FileText className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm text-brand-text dark:text-gray-300">Presupuestos</p>
                  <p className="text-2xl font-bold text-brand-dark dark:text-gray-100">
                    {totalBudgets}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 text-sm text-gray-500">
                   <span>+0%</span>
                </div>
                <p className="text-xs text-brand-text dark:text-gray-400">vs mes anterior</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-primary rounded-2xl p-4 shadow-soft border border-brand-light dark:border-dark-surface"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                  <DollarSign className="w-6 h-6 text-brand-dark dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-brand-text dark:text-gray-300">Ingresos</p>
                  <p className="text-2xl font-bold text-brand-dark dark:text-gray-100">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 text-sm text-gray-500">
                   <span>+0%</span>
                </div>
                <p className="text-xs text-brand-text dark:text-gray-400">crecimiento mensual</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-dark-primary rounded-2xl p-4 shadow-soft border border-brand-light dark:border-dark-surface"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/50">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <p className="text-sm text-brand-text dark:text-gray-300">Pendientes</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(pending)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 text-sm text-gray-500">
                   <span>-0%</span>
                </div>
                <p className="text-xs text-brand-text dark:text-gray-400">vs mes anterior</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-dark-primary rounded-2xl p-4 sm:p-6 shadow-lg border border-brand-light dark:border-dark-surface order-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-dark dark:text-gray-100">
                Ingresos vs Pagos pendientes
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-3 py-2 border border-brand-light dark:border-dark-surface rounded-lg bg-white dark:bg-dark-surface dark:text-gray-200 text-sm"
                >
                  <option value="30d">Últimos 30 días</option>
                  <option value="6m">Últimos 6 meses</option>
                  <option value="ytd">Año actual</option>
                </select>
                <div className="text-sm text-brand-text dark:text-gray-300">
                  ↑ {growthPercent}% respecto a mes anterior
                </div>
              </div>
            </div>

            <div className="min-h-[220px]">
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="mt-6 bg-brand-light dark:bg-dark-surface/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-brand-dark dark:text-gray-200 mb-3">
                Resumen
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-white dark:bg-dark-primary rounded-lg shadow-sm">
                  <p className="text-xs text-brand-text dark:text-gray-400">
                    Presupuestos aprobados
                  </p>
                  <p className="font-bold text-brand-dark dark:text-gray-100">
                    {approvedBudgetsCount}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-dark-primary rounded-lg shadow-sm">
                  <p className="text-xs text-brand-text dark:text-gray-400">Pagos recibidos</p>
                  <p className="font-bold text-brand-dark dark:text-gray-100">
                    {totalPaymentsCount}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-dark-primary rounded-lg shadow-sm">
                  <p className="text-xs text-brand-text dark:text-gray-400">Pendientes</p>
                  <p className="font-bold text-brand-dark dark:text-gray-100">
                    {pendingPaymentsCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-primary rounded-2xl p-4 sm:p-6 shadow-lg border border-brand-light dark:border-dark-surface order-2">
            <h3 className="text-lg font-semibold text-brand-dark dark:text-gray-100 mb-3">
              Alertas rápidas
            </h3>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-gray-200">
                    {approvedBudgetsCount} presupuestos aprobados
                  </p>
                  <button className="text-xs text-brand-mid dark:text-green-400 mt-1">
                    Ver detalle
                  </button>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-yellow-50 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-gray-200">
                    {pendingPaymentsCount} pago(s) próximo(s) a vencer
                  </p>
                  <button className="text-xs text-brand-mid dark:text-green-400 mt-1">
                    Ver detalle
                  </button>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-gray-200">
                    {pendingPaymentsCount} Pago(s) vencido(s)
                  </p>
                  <button className="text-xs text-brand-mid dark:text-green-400 mt-1">
                    Ver detalle
                  </button>
                </div>
              </li>
            </ul>

            <h4 className="text-md font-semibold text-brand-dark dark:text-gray-100 mb-3">
              Actividad reciente
            </h4>
            <ul className="space-y-2 text-sm text-brand-text dark:text-gray-400">
              {recentActivityList.length > 0 ? (
                recentActivityList.map((activity, i) => (
                  <li key={i} className="py-2 border-b border-brand-light/50 dark:border-dark-surface/50">
                    {activity.text}
                  </li>
                ))
              ) : (
                <li className="py-2">No hay actividad reciente.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

