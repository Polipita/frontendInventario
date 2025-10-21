import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ usuario: '', contrasena: '' });
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('login'); // "login" o "verify"
  const [userId, setUserId] = useState(null); // 👈 importante
  const { login, verifyCode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (step === 'login') {
      const result = await login(credentials);
      console.log('[LOGIN] result after login():', result);
console.log('[LOGIN] pendingUserId in localStorage:', localStorage.getItem('pendingUserId'));

      setLoading(false);

      if (result.step === 'verify') {
        // 👇 guardamos el ID que devuelve el backend
        setUserId(result.userId);
        setStep('verify');
      } else if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Credenciales incorrectas');
      }
    } else if (step === 'verify') {
      if (!userId) {
        setError('Error interno: falta el ID del usuario');
        setLoading(false);
        return;
      }
      console.log('[LOGIN] calling verifyCode with codigo:', codigo.trim());

      const result = await verifyCode(codigo.trim());
      setLoading(false);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Código incorrecto');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          {step === 'login' ? 'Iniciar Sesión' : 'Verificación de Código'}
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 'login' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={credentials.usuario}
                    onChange={(e) => setCredentials({ ...credentials, usuario: e.target.value })}
                    placeholder="Tu usuario"
                    className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    value={credentials.contrasena}
                    onChange={(e) => setCredentials({ ...credentials, contrasena: e.target.value })}
                    placeholder="Tu contraseña"
                    className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Código enviado a tu correo</label>
                <div className="mt-1 relative">
                  <KeyRound className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ingresa el código"
                    className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-2 px-4 rounded-md text-white font-medium transition-all ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" /> Procesando...
              </>
            ) : step === 'login' ? (
              'Iniciar Sesión'
            ) : (
              'Verificar Código'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
