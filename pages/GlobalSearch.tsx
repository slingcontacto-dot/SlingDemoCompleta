
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Package, User, ShoppingCart, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../types';

export default function GlobalSearch() {
  const { products, clients, sales, suppliers } = useApp();
  const [query, setQuery] = useState('');

  const hasQuery = query.length > 1;

  // Filter Logic
  const foundProducts = hasQuery ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase())) : [];
  const foundClients = hasQuery ? clients.filter(c => c.lastName.toLowerCase().includes(query.toLowerCase()) || c.firstName.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase())) : [];
  const foundSales = hasQuery ? sales.filter(s => String(s.id).includes(query) || s.client.toLowerCase().includes(query.toLowerCase())) : [];
  const foundSuppliers = hasQuery ? suppliers.filter(s => s.name.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-white">Búsqueda Global</h2>
       
       <div className="relative">
         <Search className="absolute left-4 top-3.5 text-slate-500" size={24} />
         <input 
           className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-14 pr-4 text-lg text-white focus:outline-none focus:border-blue-500 shadow-lg"
           placeholder="Buscar productos, clientes, ventas, proveedores..."
           value={query}
           onChange={e => setQuery(e.target.value)}
           autoFocus
         />
       </div>

       {hasQuery && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Products Results */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
               <h3 className="text-slate-400 uppercase text-xs font-bold mb-3 flex items-center gap-2">
                  <Package size={14}/> Productos ({foundProducts.length})
               </h3>
               <div className="space-y-2 max-h-60 overflow-y-auto">
                  {foundProducts.map(p => (
                     <div key={p.id} className="p-2 hover:bg-slate-800 rounded flex justify-between items-center cursor-default">
                        <div>
                           <div className="text-white font-medium">{p.name}</div>
                           <div className="text-xs text-slate-500">{p.id} • {p.category}</div>
                        </div>
                        <div className="text-emerald-400 font-mono">{formatCurrency(p.price)}</div>
                     </div>
                  ))}
                  {foundProducts.length === 0 && <div className="text-slate-600 text-sm italic">Sin resultados</div>}
               </div>
            </div>

            {/* Clients Results */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
               <h3 className="text-slate-400 uppercase text-xs font-bold mb-3 flex items-center gap-2">
                  <User size={14}/> Clientes ({foundClients.length})
               </h3>
               <div className="space-y-2 max-h-60 overflow-y-auto">
                  {foundClients.map(c => (
                     <div key={c.id} className="p-2 hover:bg-slate-800 rounded flex justify-between items-center cursor-default">
                        <div>
                           <div className="text-white font-medium">{c.lastName}, {c.firstName}</div>
                           <div className="text-xs text-slate-500">{c.email}</div>
                        </div>
                     </div>
                  ))}
                  {foundClients.length === 0 && <div className="text-slate-600 text-sm italic">Sin resultados</div>}
               </div>
            </div>

            {/* Sales Results */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
               <h3 className="text-slate-400 uppercase text-xs font-bold mb-3 flex items-center gap-2">
                  <ShoppingCart size={14}/> Ventas ({foundSales.length})
               </h3>
               <div className="space-y-2 max-h-60 overflow-y-auto">
                  {foundSales.map(s => (
                     <div key={s.id} className="p-2 hover:bg-slate-800 rounded flex justify-between items-center cursor-default">
                        <div>
                           <div className="text-white font-medium">Venta #{s.id}</div>
                           <div className="text-xs text-slate-500">{formatDate(s.date)} • {s.client}</div>
                        </div>
                        <div className="text-emerald-400 font-mono">{formatCurrency(s.total)}</div>
                     </div>
                  ))}
                  {foundSales.length === 0 && <div className="text-slate-600 text-sm italic">Sin resultados</div>}
               </div>
            </div>

            {/* Suppliers Results */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
               <h3 className="text-slate-400 uppercase text-xs font-bold mb-3 flex items-center gap-2">
                  <Truck size={14}/> Proveedores ({foundSuppliers.length})
               </h3>
               <div className="space-y-2 max-h-60 overflow-y-auto">
                  {foundSuppliers.map(s => (
                     <div key={s.id} className="p-2 hover:bg-slate-800 rounded flex justify-between items-center cursor-default">
                        <div>
                           <div className="text-white font-medium">{s.name}</div>
                           <div className="text-xs text-slate-500">{s.rubro}</div>
                        </div>
                     </div>
                  ))}
                  {foundSuppliers.length === 0 && <div className="text-slate-600 text-sm italic">Sin resultados</div>}
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
