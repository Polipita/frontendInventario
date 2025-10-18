// 🟩 Reemplaza tu contenido de App.js por este mejorado:
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventario from './components/Inventario';
import Ventas from './components/Ventas';
import Empleados from './components/Empleados';
import PrivateRoute from './components/PrivateRoute';

const AppContent = () => {
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gray-50">
      {token && (
        <>
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Botón de menú hamburguesa solo visible en móvil */}
          <button
            className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </>
      )}

      {/* Contenido principal */}
      <main
        className={`transition-all duration-300 p-4 ${
          token ? "lg:ml-64" : "ml-0"
        }`}
      >
        <Routes>
          <Route
            path="/login"
            element={!token ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Dashboard />
                </motion.div>
              </PrivateRoute>
            }
          />
          <Route
            path="/inventario"
            element={
              <PrivateRoute>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Inventario />
                </motion.div>
              </PrivateRoute>
            }
          />
          <Route
            path="/ventas"
            element={
              <PrivateRoute>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Ventas />
                </motion.div>
              </PrivateRoute>
            }
          />
          <Route
            path="/empleados"
            element={
              <PrivateRoute adminOnly={true}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Empleados />
                </motion.div>
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to={token ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </main>
    </div>
  );
};


const App = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;
