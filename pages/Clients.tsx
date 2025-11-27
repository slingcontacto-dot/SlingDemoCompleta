
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Client, EMAIL_DOMAINS } from '../types';
import { Search, Plus, Edit2, Trash2, X, Phone, Mail, MapPin } from 'lucide-react';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Email Splitting Logic
  const [emailUser, setEmailUser] = useState('');
  const [emailDomain, setEmailDomain] = useState(EMAIL_DOMAINS[0]);

  const [formData, setFormData] = useState<Partial<Client>>({
    firstName: '', lastName: '', phone: '', address: '', notes: ''
  });

  // Sync email parts when editing
  useEffect(() => {
     if (editingClient && editingClient.email) {
        const parts = editingClient.email.split('@');
        if (parts.length === 2) {
           setEmailUser(parts[0]);
           setEmailDomain(`@${parts[1]}`);
        } else {
           setEmailUser(editingClient.email);
           setEmailDomain(EMAIL_DOMAINS[0]);
        }
     } else if (!editingClient) {
        setEmailUser('');
        setEmailDomain(EMAIL_DOMAINS[0]);
     }
  }, [editingClient]);

  const filteredClients = clients.filter(c => 
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({
        firstName: '', lastName: '', phone: '', address: '', notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullEmail = emailUser ? `${emailUser}${emailDomain}` : '';
    const finalData = { ...formData, email: fullEmail };

    if (editingClient) {
      updateClient(editingClient.id, finalData);
    } else {
      const nextId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
      addClient({ ...finalData, id: nextId } as Client);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestión de Clientes</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative">
        <Search className="absolute left-7 top-6.5 text-slate-500" size={20} />
        <input 
          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(c => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-colors group relative">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{c.lastName}, {c.firstName}</h3>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">ID: {c.id}</span>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => handleOpenModal(c)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={16}/></button>
                 <button onClick={() => { if(confirm("¿Eliminar cliente?")) deleteClient(c.id); }} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16}/></button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-400">
               <div className="flex items-center gap-2">
                 <Mail size={14} className="text-blue-500" />
                 {c.email || 'N/A'}
               </div>
               <div className="flex items-center gap-2">
                 <Phone size={14} className="text-blue-500" />
                 {c.phone || 'N/A'}
               </div>
               <div className="flex items-center gap-2">
                 <MapPin size={14} className="text-blue-500" />
                 {c.address || 'N/A'}
               </div>
               {c.notes && <div className="mt-2 text-xs italic bg-slate-950 p-2 rounded">"{c.notes}"</div>}
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">No se encontraron clientes</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-sm text-slate-400">Nombre</label>
                      <input required className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white" 
                        value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-sm text-slate-400">Apellido</label>
                      <input required className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white" 
                        value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                   </div>
                </div>
                <div>
                    <label className="text-sm text-slate-400">Email</label>
                    <div className="flex gap-2">
                       <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white flex-1" 
                          placeholder="usuario"
                          value={emailUser} onChange={e => setEmailUser(e.target.value)} />
                       <select className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white w-40"
                          value={emailDomain} onChange={e => setEmailDomain(e.target.value)}
                       >
                          {EMAIL_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                    </div>
                </div>
                <div>
                    <label className="text-sm text-slate-400">Teléfono</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white" 
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                    <label className="text-sm text-slate-400">Dirección</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white" 
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div>
                    <label className="text-sm text-slate-400">Notas</label>
                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white h-20" 
                      value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
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
