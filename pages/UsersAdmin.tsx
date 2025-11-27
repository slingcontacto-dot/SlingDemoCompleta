
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Role } from '../types';
import { Plus, Trash2, Shield, User as UserIcon, Edit2, X } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function UsersAdmin() {
  const { user, usersList, addUser, deleteUser, updateUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
     username: '', role: 'employee' as Role, password: ''
  });

  // Protect Route
  if (user?.role !== 'owner') return <Navigate to="/" />;

  const handleOpenModal = (u?: User) => {
     if (u) {
        setEditingUser(u);
        setFormData({ username: u.username, role: u.role, password: u.password || '' });
     } else {
        setEditingUser(null);
        setFormData({ username: '', role: 'employee', password: '' });
     }
     setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) return;

    if (editingUser) {
        updateUser(editingUser.id, { ...formData });
    } else {
        if (usersList.some(u => u.username === formData.username)) {
            alert("El usuario ya existe");
            return;
        }
        const newId = Date.now();
        addUser({ id: newId, ...formData });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Administración de Usuarios</h2>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersList.map((u) => (
           <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                 <div className={`p-3 rounded-full ${u.role === 'owner' ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'}`}>
                    {u.role === 'owner' ? <Shield size={24}/> : <UserIcon size={24}/>}
                 </div>
                 <div>
                    <h4 className="font-bold text-white text-lg">{u.username}</h4>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">{u.role === 'owner' ? 'Administrador' : 'Empleado'}</span>
                 </div>
              </div>
              
              <div className="flex gap-2">
                 <button onClick={() => handleOpenModal(u)} className="text-blue-400 hover:text-blue-300 p-2">
                    <Edit2 size={20} />
                 </button>
                 {u.username !== user.username && (
                    <button onClick={() => { if(confirm("¿Eliminar usuario?")) deleteUser(u.id); }} className="text-slate-600 hover:text-red-500 p-2">
                        <Trash2 size={20} />
                    </button>
                 )}
              </div>
           </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
           <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-white">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="text-sm text-slate-400">Nombre de Usuario</label>
                    <input 
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                      value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                      required
                    />
                 </div>
                 <div>
                    <label className="text-sm text-slate-400">Contraseña</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                      value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                      required
                      placeholder="Mínimo 6 caracteres"
                    />
                 </div>
                 <div>
                    <label className="text-sm text-slate-400">Rol</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                      value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})}
                    >
                      <option value="employee">Empleado</option>
                      <option value="owner">Dueño (Admin)</option>
                    </select>
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
