
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Supplier, EMAIL_DOMAINS } from '../types';
import { Search, Plus, Trash2, Phone, Mail, MapPin, Edit2, X } from 'lucide-react';

export default function Suppliers() {
  const { suppliers, addSupplier, deleteSupplier, updateSupplier, user } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '', rubro: '', phone: '', address: ''
  });
  
  // Email Split
  const [emailUser, setEmailUser] = useState('');
  const [emailDomain, setEmailDomain] = useState(EMAIL_DOMAINS[0]);

  // Sync email parts
  useEffect(() => {
     if (editingSupplier && editingSupplier.email) {
        const parts = editingSupplier.email.split('@');
        if (parts.length === 2) {
           setEmailUser(parts[0]);
           setEmailDomain(`@${parts[1]}`);
        } else {
           setEmailUser(editingSupplier.email);
           setEmailDomain(EMAIL_DOMAINS[0]);
        }
     } else if (!editingSupplier) {
        setEmailUser('');
        setEmailDomain(EMAIL_DOMAINS[0]);
     }
  }, [editingSupplier]);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rubro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (s?: Supplier) => {
     if (s) {
        setEditingSupplier(s);
        setFormData(s);
     } else {
        setEditingSupplier(null);
        setFormData({ name: '', rubro: '', phone: '', address: '' });
     }
     setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullEmail = emailUser ? `${emailUser}${emailDomain}` : '';
    const finalData = { ...formData, email: fullEmail };

    if (editingSupplier) {
       updateSupplier(editingSupplier.id, finalData);
    } else {
       const newId = `PR-${String(suppliers.length + 1).padStart(4, '0')}`;
       addSupplier({ ...finalData, id: newId } as Supplier);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (user?.role !== 'owner') {
      alert("Permiso denegado.");
      return;
    }
    if (confirm("¿Eliminar proveedor?")) deleteSupplier(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Proveedores</h2>
        <button 
           onClick={() => handleOpenModal()}
           className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative">
         <Search className="absolute left-7 top-6.5 text-slate-500" size={20} />
         <input 
           className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
           placeholder="Buscar proveedor..."
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(s => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:shadow-lg transition-shadow relative group">
             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(s)} className="text-blue-400 hover:text-blue-300"><Edit2 size={18}/></button>
                <button onClick={() => handleDelete(s.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={18}/></button>
             </div>
             
             <h3 className="text-lg font-bold text-white mb-1">{s.name}</h3>
             <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs mb-4">{s.rubro}</span>
             
             <div className="space-y-2 text-sm text-slate-400">
               <div className="flex items-center gap-2">
                 <Phone size={14} className="text-blue-500" />
                 {s.phone || 'N/A'}
               </div>
               <div className="flex items-center gap-2">
                 <Mail size={14} className="text-blue-500" />
                 {s.email || 'N/A'}
               </div>
               <div className="flex items-center gap-2">
                 <MapPin size={14} className="text-blue-500" />
                 {s.address || 'N/A'}
               </div>
             </div>
          </div>
        ))}
        {filteredSuppliers.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">No se encontraron proveedores</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
           <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-white">{editingSupplier ? 'Editar Proveedor' : 'Registrar Proveedor'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="text-sm text-slate-400">Razón Social</label>
                    <input required className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white" 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-sm text-slate-400">Rubro</label>
                    <input required className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white" 
                      value={formData.rubro} onChange={e => setFormData({...formData, rubro: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-sm text-slate-400">Teléfono</label>
                      <input className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white" 
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-sm text-slate-400">Email</label>
                      <div className="flex gap-1">
                          <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white flex-1 min-w-0" 
                             placeholder="usuario"
                             value={emailUser} onChange={e => setEmailUser(e.target.value)} />
                          <select className="bg-slate-950 border border-slate-700 rounded px-1 py-2 text-white w-32"
                             value={emailDomain} onChange={e => setEmailDomain(e.target.value)}
                          >
                             {EMAIL_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                       </div>
                   </div>
                 </div>
                 <div>
                    <label className="text-sm text-slate-400">Dirección</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white" 
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
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
