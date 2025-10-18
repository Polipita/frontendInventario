// 🟦 Reemplaza el contenido de Sidebar.js con este:
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Package, ShoppingCart, Users, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, role } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/inventario', icon: Package, label: 'Inventario' },
    { path: '/ventas', icon: ShoppingCart, label: 'Ventas' },
    ...(role === 'admin' ? [{ path: '/empleados', icon: Users, label: 'Empleados' }] : []),
  ];

  return (
  <motion.div
    initial={{ x: -250 }}
    animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -250 }}
    transition={{ duration: 0.3 }}
    className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 
      ${isOpen ? 'block' : 'hidden'} 
      lg:block`}  // 👈 esto garantiza que SIEMPRE se muestre en pantallas grandes
  >
    <div className="p-6 border-b flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">TiendaGestor</h1>
      {/* Botón de cerrar visible solo en móvil */}
      <button className="lg:hidden text-gray-600" onClick={onClose}>✕</button>
    </div>

    <nav className="p-4">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={onClose}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>

    <div className="absolute bottom-0 p-4 w-full">
      <button
        onClick={logout}
        className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Cerrar Sesión
      </button>
    </div>
  </motion.div>
);

};

export default Sidebar;
