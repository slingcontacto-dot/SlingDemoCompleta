
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, Shield, Key } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, usersList } = useApp();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const foundUser = usersList.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (foundUser && foundUser.password === password) {
      login(foundUser);
    } else {
      setError('Credenciales incorrectas.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 gap-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-2">
            Sling
          </h1>
          <p className="text-slate-400">Inicio de Sesión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Usuario</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder=""
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder=""
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-900/30"
          >
            Ingresar
          </button>
        </form>
        
        <p className="mt-6 text-center text-xs text-slate-600">
           Sistema de Gestión Sling (Sistema completo)
        </p>
      </div>

      {/* Accesos del Sistema Widget */}
      <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 rounded-xl p-5">
         <div className="flex items-center gap-2 mb-4 text-blue-400 justify-center">
            <Shield size={20} />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Credenciales Demo</h3>
         </div>
         <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/50 flex justify-between items-center">
               <div>
                  <div className="font-bold text-purple-400">dueño</div>
                  <div className="text-xs text-slate-500">Acceso Total (Admin)</div>
               </div>
               <div className="flex items-center gap-1 text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">
                  <Key size={10}/> 123123
               </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/50 flex justify-between items-center">
               <div>
                  <div className="font-bold text-blue-400">vendedor</div>
                  <div className="text-xs text-slate-500">Ventas, Gestión, Inventario</div>
               </div>
               <div className="flex items-center gap-1 text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">
                  <Key size={10}/> 123
               </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/50 flex justify-between items-center">
               <div>
                  <div className="font-bold text-orange-400">taller</div>
                  <div className="text-xs text-slate-500">Pedidos, Gestión, Inventario</div>
               </div>
               <div className="flex items-center gap-1 text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">
                  <Key size={10}/> 123
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
