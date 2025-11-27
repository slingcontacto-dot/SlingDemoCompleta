
import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../types';

const Card = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
       <Icon size={64} />
    </div>
    <div className="relative z-10">
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      {/* Changed text-3xl to text-2xl and added truncate to handle large numbers */}
      <h3 className="text-2xl font-bold text-white truncate" title={String(value)}>
        {value}
      </h3>
    </div>
  </div>
);

export default function Dashboard() {
  const { sales, products, orders } = useApp();

  // Metrics Logic
  const today = new Date().toISOString().split('T')[0];
  const salesToday = sales
    .filter(s => s.date.startsWith(today))
    .reduce((acc, curr) => acc + curr.total, 0);

  const lowStockProducts = products.filter(p => p.stock <= 5);
  const totalStockValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
  
  // Chart Data Preparation
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const salesData = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }), 
    total: sales.filter(s => s.date.startsWith(date)).reduce((acc, curr) => acc + curr.total, 0)
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white">Panel de Control</h2>
           <span className="text-sm text-slate-400">{formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Main Metrics Area - 3 Columns */}
         <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card 
                title="Ventas Hoy" 
                value={formatCurrency(salesToday)} 
                icon={DollarSign} 
                color="text-green-500" 
              />
              <Card 
                title="Alertas Stock" 
                value={lowStockProducts.length} 
                icon={AlertTriangle} 
                color="text-red-500" 
              />
              <Card 
                title="Pedidos Activos" 
                value={orders.filter(o => o.status !== 'Cancelado' && o.status !== 'Entregado').length} 
                icon={Package} 
                color="text-blue-500" 
              />
              <Card 
                title="Valuación Stock" 
                value={formatCurrency(totalStockValue)} 
                icon={TrendingUp} 
                color="text-purple-500" 
              />
            </div>

            {/* Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Ventas de la Semana</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
         </div>

         {/* Sidebar / Right Column - 1 Column */}
         <div className="space-y-6">
            {/* Low Stock List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Stock Crítico</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {lowStockProducts.length === 0 ? (
                   <p className="text-slate-500 text-sm">Todo en orden.</p>
                ) : (
                  lowStockProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="truncate pr-4">
                        <p className="text-sm font-medium text-white truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.id}</p>
                      </div>
                      <span className="px-2 py-1 bg-red-950/50 text-red-400 text-xs font-bold rounded">
                        {p.stock} un.
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
