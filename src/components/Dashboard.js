import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Package, DollarSign, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { api } = useAuth();
  const [productos, setProductos] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    id_usuario: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productosRes, usuariosRes, reportesRes] = await Promise.all([
          api.get('/productos'),
          api.get('/reportes/usuarios'),
          api.get('/reportes/ventas-filtradas'),
        ]);
        setProductos(productosRes.data);
        setUsuarios(usuariosRes.data);
        setReportes(reportesRes.data);
      } catch (err) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  useEffect(() => {
    const fetchFiltrado = async () => {
      try {
        const params = new URLSearchParams(filtros);
        const res = await api.get(`/reportes/ventas-filtradas?${params}`);
        setReportes(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFiltrado();
  }, [filtros, api]);

  const totalProductos = productos.length;
  const productosAgotados = productos.filter(p => p.stock <= 0).length;
  const totalVentas = reportes.reduce(
    (sum, r) => sum + Number(r.total_vendido || 0),
    0
  );

  const chartData = {
    labels: reportes.map(r => r.nombre || r.producto || "Sin nombre"),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: reportes.map(r => Number(r.cantidad_vendida || r.cantidad || 0)),
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: '#374151' } },
      title: {
        display: true,
        text: 'Productos Más Vendidos',
        color: '#1f2937',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      x: { ticks: { color: '#4b5563' } },
      y: { ticks: { color: '#4b5563' } },
    },
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  if (loading)
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  if (error)
    return <div className="text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 space-y-8">
      {/* Título */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold text-gray-900"
      >
        Dashboard General
      </motion.h1>

      {/* FILTROS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-2xl shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
      >
        <FiltroCampo label="Desde" name="fechaInicio" value={filtros.fechaInicio} onChange={handleFiltroChange} type="date" />
        <FiltroCampo label="Hasta" name="fechaFin" value={filtros.fechaFin} onChange={handleFiltroChange} type="date" />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Empleado</label>
          <select
            name="id_usuario"
            value={filtros.id_usuario}
            onChange={handleFiltroChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="">Todos</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard icon={Package} color="bg-blue-50 text-blue-600" label="Productos Totales" value={totalProductos} />
        <MetricCard icon={DollarSign} color="bg-green-50 text-green-600" label="Total Ventas" value={`S/ ${Number(totalVentas).toFixed(2)}`} />
        <MetricCard icon={AlertTriangle} color="bg-red-50 text-red-600" label="Productos Agotados" value={productosAgotados} />
      </div>

      {/* GRÁFICO */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.3 } }}
        className="bg-white p-6 rounded-2xl shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Productos Más Vendidos</h2>
        <div className="h-72">
          {reportes.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p className="text-center text-gray-500">No hay datos para mostrar</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// 🔹 Subcomponentes reutilizables

const FiltroCampo = ({ label, name, value, onChange, type }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
    />
  </div>
);

const MetricCard = ({ icon: Icon, color, label, value }) => (
  <motion.div
    initial={{ y: 15, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.3 }}
    className={`p-6 rounded-2xl shadow-md bg-white border-l-4 border-blue-500`}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default Dashboard;
