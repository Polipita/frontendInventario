import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Trash2, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Ventas = () => {
  const { api } = useAuth();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await api.get('/productos');
        setProductos(res.data.filter((p) => p.stock > 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [api]);

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (p.codigo && p.codigo.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCarrito = (product) => {
    const existing = carrito.find((item) => item.id === product.id);
    if (existing) {
      if (existing.cantidad < product.stock) {
        setCarrito(
          carrito.map((item) =>
            item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
          )
        );
      }
    } else {
      setCarrito([...carrito, { ...product, cantidad: 1 }]);
    }
  };

  const removeFromCarrito = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const updateCantidad = (id, cantidad) => {
    if (cantidad <= 0) return removeFromCarrito(id);
    setCarrito(
      carrito.map((item) => (item.id === id ? { ...item, cantidad } : item))
    );
  };

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const handleVenta = async () => {
    try {
      const items = carrito.map((item) => ({
        id_producto: item.id,
        cantidad: item.cantidad,
      }));
      await api.post('/ventas', { productos: items });
      alert('✅ Venta registrada exitosamente');
      setCarrito([]);
    } catch (err) {
      alert('❌ Error al registrar venta');
    }
  };

  if (loading) return <div className="p-6 text-center">Cargando productos...</div>;

  return (
    <div className="p-6 space-y-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold"
      >
        Ventas
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🔹 Productos */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Seleccionar Productos</h2>

          <div className="flex items-center mb-4 border border-gray-300 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[480px] pr-2">
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.03 }}
                  className="border rounded-lg p-4 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <h3 className="font-medium text-lg">{p.nombre}</h3>
                    <p className="text-gray-600 text-sm mt-1">
${Number(p.precio).toFixed(2)} • Stock: {p.stock}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCarrito(p)}
                    className="bg-green-500 text-white mt-3 py-2 rounded-lg hover:bg-green-600 transition-all"
                    disabled={p.stock === 0}
                  >
                    <Plus className="inline w-4 h-4 mr-1" /> Agregar
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-2 py-4">
                No se encontraron productos.
              </p>
            )}
          </div>
        </div>

        {/* 🔹 Carrito */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 flex flex-col"
        >
          <h2 className="text-xl font-semibold mb-4">Carrito de Compra</h2>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[480px] pr-2">
            {carrito.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{item.nombre}</h3>
<p className="text-gray-600 text-sm">${Number(item.precio).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateCantidad(item.id, item.cantidad - 1)}
                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span>{item.cantidad}</span>
                  <button
                    onClick={() => updateCantidad(item.id, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stock}
                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    +
                  </button>
                  <span className="ml-4 font-semibold">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCarrito(item.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {carrito.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <p className="text-lg font-bold">Total: ${total.toFixed(2)}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVenta}
                className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 font-semibold hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> Confirmar Venta
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Ventas;
