
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Discount } from '../types';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react';

export default function Discounts() {
  const { discounts, addDiscount, toggleDiscount, deleteDiscount } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Discount>>({
     name: '', type: 'percentage', value: 0, active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Date.now();
    addDiscount({ ...formData, id: newId } as Discount);
    setIsModalOpen(false);
    setFormData({ name: '', type: 'percentage', value: 0, active: true });
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Descuentos y Promociones</h2>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo Descuento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {discounts.map(d => (
            <div key={d.id} className={`bg-slate-900 border ${d.active ? 'border-green-900/50' : 'border-slate-800'} rounded-xl p-5 relative overflow-hidden`}>
               <div className={`absolute top-0 right-0 p-4 opacity-5 ${d.active ? 'text-green-500' : 'text-slate-500'}`}>
                  <Tag size={64} />
               </div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                     <h3 className={`text-xl font-bold ${d.active ? 'text-white' : 'text-slate-500'}`}>{d.name}</h3>
                     <p className="text-sm text-slate-400">
                        {d.type === 'percentage' ? `${d.value}% OFF` : `$${d.value} Descuento Fijo`}
                     </p>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => toggleDiscount(d.id)} className={`${d.active ? 'text-green-400' : 'text-slate-600'}`}>
                        {d.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                     </button>
                     <button onClick={() => deleteDiscount(d.id)} className="text-slate-600 hover:text-red-500">
                        <Trash2 size={20} />
                     </button>
                  </div>
               </div>
               
               <div className="mt-2 inline-block px-2 py-1 rounded text-xs font-bold uppercase bg-slate-950 text-slate-500">
                  {d.active ? 'Activo' : 'Inactivo'}
               </div>
            </div>
         ))}
         {discounts.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">No hay descuentos configurados.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
           <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Crear Descuento</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="text-sm text-slate-400">Nombre Promoción</label>
                    <input required className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white" 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-sm text-slate-400">Tipo</label>
                       <select className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                          value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}
                       >
                          <option value="percentage">Porcentaje (%)</option>
                          <option value="fixed">Monto Fijo ($)</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-sm text-slate-400">Valor</label>
                       <input type="number" required min="0" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white" 
                         value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
                    </div>
                 </div>
                 <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded">Guardar</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
