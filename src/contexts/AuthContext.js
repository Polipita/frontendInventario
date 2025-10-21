import React, { createContext, useContext, useState, useEffect } from 'react';  
import { useNavigate } from 'react-router-dom';  
import axios from 'axios';  

const AuthContext = createContext();  

export const useAuth = () => {  
  const context = useContext(AuthContext);  
  if (!context) {  
    throw new Error('useAuth must be used within an AuthProvider');  
  }  
  return context;  
};  

export const AuthProvider = ({ children }) => {  
  const [user, setUser] = useState(null);  
  const [token, setToken] = useState(localStorage.getItem('token'));  
  const [role, setRole] = useState(localStorage.getItem('role'));  
  const navigate = useNavigate();  

  const baseURL = process.env.REACT_APP_API_URL;  

  const api = axios.create({  
    baseURL,  
  });  

  api.interceptors.request.use(  
    (config) => {  
      if (token) {  
        config.headers.Authorization = `Bearer ${token}`;  
      }  
      return config;  
    },  
    (error) => Promise.reject(error)  
  );  

  api.interceptors.response.use(  
    (response) => response,  
    (error) => {  
      if (error.response?.status === 401) {  
        logout();  
        navigate('/login');  
      }  
      return Promise.reject(error);  
    }  
  );  

const login = async (credentials) => {
  try {
    console.log('[AUTH] login -> credentials:', credentials);
    const response = await api.post('/auth/login', credentials);
    console.log('[AUTH] /auth/login response:', response.data);

    const data = response.data;

    if (data.step === 'verify') {
      // guarda ID temporal y loguea
      console.log('[AUTH] guardando pendingUserId:', data.userId);
      localStorage.setItem('pendingUserId', data.userId);
      return { step: 'verify', message: data.message, userId: data.userId };
    }

    const { token: newToken, usuario, rol } = data;
    // ... resto igual
    setToken(newToken);
    setUser(usuario);
    setRole(rol);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', rol);
    localStorage.setItem('usuario', usuario);

    return { success: true };
  } catch (error) {
    console.error('[AUTH] login error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error || 'Error en login' };
  }
};


const verifyCode = async (codigo) => {
  try {
    const userId = localStorage.getItem('pendingUserId'); // 👈 obtén el id
    console.log("[AUTH] verifyCode -> pendingUserId from localStorage:", userId, "codigo:", codigo);

    const response = await api.post('/auth/verify-code', { userId, code: codigo }); // 👈 usa "code" y no "codigo"

    const data = response.data;

    if (data.success) {
      const { token: newToken, usuario, rol } = data;

      setToken(newToken);
      setUser(usuario);
      setRole(rol);

      localStorage.setItem('token', newToken);
      localStorage.setItem('role', rol);
      localStorage.setItem('usuario', usuario);

      return { success: true };
    } else {
      return { success: false, error: data.error || 'Código inválido' };
    }
  } catch (error) {
    console.log("[AUTH] verifyCode error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error || 'Error al verificar código' };
  }
};



  const register = async (userData) => {  
    try {  
      const response = await api.post('/auth/register', userData);  
      return { success: true, message: 'Usuario creado exitosamente' };  
    } catch (error) {  
      return { success: false, error: error.response?.data?.message || 'Error en registro' };  
    }  
  };  

  const logout = () => {  
    setUser(null);  
    setToken(null);  
    setRole(null);  
    localStorage.removeItem('token');  
    localStorage.removeItem('role');  
  };  

  useEffect(() => {  
    if (token) {  
      // Verify token if needed  
    } else {  
      setUser(null);  
      setRole(null);  
    }  
  }, [token]);  

  const value = {  
    user,  
    token,  
    role,  
    login,  
    verifyCode,
    register,  
    logout,  
    api,  
  };  

  return (  
    <AuthContext.Provider value={value}>  
      {children}  
    </AuthContext.Provider>  
  );  
};  

export default AuthContext;