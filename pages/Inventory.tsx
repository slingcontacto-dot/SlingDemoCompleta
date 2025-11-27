
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, CATEGORIES, formatCurrency } from '../types';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct, suppliers, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '', name: '', category: CATEGORIES[0], price: 0, stock: 0, supplier: ''
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === 'All' || p.category === filterCat;
    return matchesSearch && matchesCat;
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      // Generate ID
      const nextId = `P-${String(products.length + 1).padStart(4, '0')}`;
      setFormData({
        id: nextId, name: '', category: CATEGORIES[0], price: 0, stock: 0, supplier: suppliers[0]?.name || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = formData as Product;
    
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (user?.role !== 'owner') {
      alert("Solo el dueño puede eliminar productos.");
      return;
    }
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Inventario</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o código..." 
            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="All">Todas las Categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-right">Precio</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-slate-400">{p.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 text-xs">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-emerald-400">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock <= 5 ? 'bg-red-950 text-red-400' : 'bg-green-950 text-green-400'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(p)} className="text-blue-400 hover:text-blue-300 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-slate-500">No se encontraron productos.</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Código</label>
                    <input 
                      type="text" disabled value={formData.id} 
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-500 cursor-not-allowed"
                    />
                 </div>
                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Stock</label>
                    <input 
                      type="number" required min="0" value={formData.stock}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Nombre</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm text-slate-400 mb-1">Categoría</label>
                   <select 
                     value={formData.category}
                     onChange={e => setFormData({...formData, category: e.target.value})}
                     className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                   >
                     {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm text-slate-400 mb-1">Precio Venta</label>
                   <input 
                     type="number" required min="0" step="0.01" value={formData.price}
                     onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                     className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                   />
                </div>
              </div>

              <div>
                 <label className="block text-sm text-slate-400 mb-1">Proveedor</label>
                 <select 
                    value={formData.supplier}
                    onChange={e => setFormData({...formData, supplier: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                 >
                    <option value="">Seleccionar...</option>
                    {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                 </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
