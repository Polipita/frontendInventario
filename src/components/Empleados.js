import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Empleados = () => {
  const { api } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    usuario: "",
    correo: "",
    contrasena: "",
    rol: "empleado",
  });

  const inputRef = useRef(null);

  useEffect(() => {
    fetchEmpleados();
  }, [api]);

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const response = await api.get("/empleados");
      setEmpleados(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  const validarContrasena = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.contrasena && !validarContrasena(formData.contrasena)) {
      setError(
        "Contraseña debe tener al menos 8 caracteres, una mayúscula y una minúscula"
      );
      return;
    }

    try {
      if (isEdit) {
        await api.put(`/empleados/${formData.id}`, formData);
      } else {
        await api.post("/empleados", formData);
      }
      setShowModal(false);
      setFormData({
        id: null,
        nombre: "",
        usuario: "",
        contrasena: "",
        rol: "empleado",
      });
      fetchEmpleados();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al guardar empleado");
    }
  };

  const openModalCreate = () => {
    setFormData({
      id: null,
      nombre: "",
      usuario: "",
      correo: "",
      contrasena: "",
      rol: "empleado",
    });
    setIsEdit(false);
    setShowModal(true);
    setError("");
  };

  const openModalEdit = (emp) => {
    setFormData({ ...emp, contrasena: "" });
    setIsEdit(true);
    setShowModal(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este empleado?")) return;
    try {
      await api.delete(`/empleados/${id}`);
      fetchEmpleados();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar empleado");
    }
  };

  const total = empleados.length;
  const totalAdmins = empleados.filter((e) => e.rol === "admin").length;
  const totalEmpleados = total - totalAdmins;

  if (loading)
    return <div className="p-6 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold flex items-center gap-2"
        >
          <Users className="text-blue-500" /> Empleados
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openModalCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" /> Agregar Empleado
        </motion.button>
      </div>

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Total Empleados" value={total} color="blue" />
        <SummaryCard label="Empleados" value={totalEmpleados} color="green" />
      </div>

      {/* ALERTA FLOTANTE */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]"
        >
          {error}
        </motion.div>
      )}

      {/* TABLA */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {empleados.map((emp) => (
              <motion.tr
                key={emp.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">{emp.nombre}</td>
                <td className="px-6 py-4">{emp.usuario}</td>
                <td className="px-6 py-4">{emp.correo}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      emp.rol === "admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {emp.rol}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => openModalEdit(emp)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Edit size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {empleados.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No hay empleados registrados
          </p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Editar Empleado" : "Agregar Empleado"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
  <input
    ref={inputRef}
    type="text"
    placeholder="Nombre"
    value={formData.nombre}
    onChange={(e) =>
      setFormData({ ...formData, nombre: e.target.value })
    }
    required
    className="w-full px-3 py-2 border border-gray-300 rounded"
  />

  <input
    type="text"
    placeholder="Usuario"
    value={formData.usuario}
    onChange={(e) =>
      setFormData({ ...formData, usuario: e.target.value })
    }
    required
    className="w-full px-3 py-2 border border-gray-300 rounded"
  />

  <input
    type="email"
    placeholder="Correo electrónico"
    value={formData.correo}
    onChange={(e) =>
      setFormData({ ...formData, correo: e.target.value })
    }
    required
    className="w-full px-3 py-2 border border-gray-300 rounded"
  />

  {/* 👁️ Campo de contraseña con botón para mostrar/ocultar */}
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Contraseña"
      value={formData.contrasena}
      onChange={(e) =>
        setFormData({ ...formData, contrasena: e.target.value })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded pr-10"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
    >
      {showPassword ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.21 16.057 7 19 11.478 19a10.5 10.5 0 009.542-7 10.499 10.499 0 00-3.563-4.865m-3.02-1.384A10.45 10.45 0 0011.478 5c-4.477 0-8.268 2.943-9.542 7 .6 1.912 1.89 3.543 3.542 4.664"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
    </button>
  </div>

  <select
    value={formData.rol}
    onChange={(e) =>
      setFormData({ ...formData, rol: e.target.value })
    }
    className="w-full px-3 py-2 border border-gray-300 rounded"
  >
    <option value="empleado">Empleado</option>
    <option value="admin">Admin</option>
  </select>

  <div className="flex justify-end gap-2">
    <button
      type="button"
      onClick={() => setShowModal(false)}
      className="px-4 py-2 bg-gray-300 rounded"
    >
      Cancelar
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {isEdit ? "Actualizar" : "Crear"}
    </button>
  </div>
</form>

          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, color }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 flex flex-col items-center shadow-sm`}
  >
    <p className={`text-${color}-700 text-sm font-medium`}>{label}</p>
    <p className={`text-${color}-900 text-3xl font-bold`}>{value}</p>
  </motion.div>
);

export default Empleados;
