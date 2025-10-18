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
    const response = await api.post('/auth/login', credentials);  
    const { token: newToken, usuario, rol } = response.data;  

    setToken(newToken);  
    setUser(usuario);  
    setRole(rol);  

    localStorage.setItem('token', newToken);  
    localStorage.setItem('role', rol);  
    localStorage.setItem('usuario', usuario);  

    return { success: true };  
  } catch (error) {  
    return { success: false, error: error.response?.data?.error || 'Error en login' };  
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