
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CartItem, Product, PurchaseOrder, formatCurrency, formatDate } from '../types';
import { Plus, X, Search, CheckCircle, Ban, Clock, Minus } from 'lucide-react';

export default function PurchaseOrders() {
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus, suppliers, products } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetailId, setViewDetailId] = useState<string | null>(null);

  // New Order State
  const [supplierId, setSupplierId] = useState('');
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [prodSearch, setProdSearch] = useState('');

  // Add Item to Purchase Order Logic
  const handleAddItem = (prod: Product) => {
    // Check if already in items
    const existing = orderItems.find(i => i.id === prod.id);
    if (existing) {
       setOrderItems(prev => prev.map(i => i.id === prod.id ? {...i, quantity: i.quantity + 1} : i));
    } else {
       setOrderItems(prev => [...prev, { ...prod, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setOrderItems(prev => prev.filter(i => i.id !== id));
  };

  const handleCreate = () => {
     if (!supplierId || orderItems.length === 0) return;
     const total = orderItems.reduce((acc, item) => acc + (item.supplierPrice * item.quantity), 0);
     const newOrder: PurchaseOrder = {
        id: `OC-${Date.now()}`,
        date: new Date().toISOString(),
        supplierId,
        items: orderItems,
        total,
        status: 'Pendiente'
     };
     addPurchaseOrder(newOrder);
     setIsModalOpen(false);
     setSupplierId('');
     setOrderItems([]);
  };

  const handleReceive = (id: string) => {
    if (confirm("¿Confirmar recepción? Esto aumentará el stock de los productos.")) {
       updatePurchaseOrderStatus(id, 'Recibida');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Órdenes de Compra (Proveedores)</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Nueva Orden
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Proveedor</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {purchaseOrders.slice().reverse().map(po => {
               const supplierName = suppliers.find(s => s.id === po.supplierId)?.name || po.supplierId;
               return (
                 <tr key={po.id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-mono text-sm">{po.id}</td>
                    <td className="px-6 py-4 text-slate-300">{formatDate(po.date)}</td>
                    <td className="px-6 py-4 text-white font-medium">{supplierName}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-xs font-bold border ${
                          po.status === 'Recibida' ? 'bg-green-950 border-green-800 text-green-400' :
                          po.status === 'Cancelada' ? 'bg-red-950 border-red-800 text-red-400' :
                          'bg-yellow-950 border-yellow-800 text-yellow-400'
                       }`}>
                          {po.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-400">{formatCurrency(po.total)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                       <button onClick={() => setViewDetailId(po.id)} className="text-blue-400 hover:text-blue-300 text-xs underline">Ver Detalle</button>
                       {po.status === 'Pendiente' && (
                          <>
                            <button onClick={() => handleReceive(po.id)} title="Recibir Stock" className="text-green-400 hover:text-green-300"><CheckCircle size={18}/></button>
                            <button onClick={() => updatePurchaseOrderStatus(po.id, 'Cancelada')} title="Cancelar" className="text-red-400 hover:text-red-300"><Ban size={18}/></button>
                          </>
                       )}
                    </td>
                 </tr>
               );
            })}
            {purchaseOrders.length === 0 && (
               <tr><td colSpan={6} className="text-center py-8 text-slate-500">No hay órdenes registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl shadow-2xl p-6 h-[80vh] flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Nueva Orden de Compra</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                   <label className="text-sm text-slate-400">Proveedor</label>
                   <select 
                     className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                     value={supplierId} onChange={e => setSupplierId(e.target.value)}
                   >
                     <option value="">Seleccionar Proveedor...</option>
                     {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-sm text-slate-400">Total Estimado</label>
                   <div className="text-xl font-bold text-emerald-400">
                      {formatCurrency(orderItems.reduce((acc, i) => acc + (i.supplierPrice * i.quantity), 0))}
                   </div>
                </div>
             </div>

             <div className="flex-1 flex gap-4 min-h-0">
                {/* Product Selector */}
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col">
                   <div className="relative mb-2">
                      <Search className="absolute left-2 top-2 text-slate-500" size={16}/>
                      <input 
                        className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-2 py-1 text-sm text-white"
                        placeholder="Buscar producto..."
                        value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                      />
                   </div>
                   <div className="overflow-y-auto flex-1 space-y-1">
                      {products
                        .filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
                        .map(p => (
                          <button key={p.id} onClick={() => handleAddItem(p)} className="w-full text-left p-2 hover:bg-slate-800 rounded text-sm flex justify-between group">
                             <div className="flex flex-col">
                                <span className="text-white truncate">{p.name}</span>
                                <span className="text-xs text-slate-500">{p.id}</span>
                             </div>
                             <span className="text-emerald-400 group-hover:text-emerald-300">{formatCurrency(p.supplierPrice)}</span>
                          </button>
                      ))}
                   </div>
                </div>

                {/* Items List */}
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col">
                   <h4 className="text-sm font-bold text-slate-300 mb-2">Items a pedir</h4>
                   <div className="overflow-y-auto flex-1 space-y-2">
                      {orderItems.map(item => (
                         <div key={item.id} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                            <div className="text-sm flex-1">
                               <div className="text-white font-medium">{item.name}</div>
                               <div className="text-xs text-slate-500">{formatCurrency(item.supplierPrice)} u.</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><Minus size={14}/></button>
                                <span className="text-sm font-bold w-6 text-center text-white">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><Plus size={14}/></button>
                                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 ml-1"><X size={16}/></button>
                            </div>
                         </div>
                      ))}
                      {orderItems.length === 0 && <div className="text-slate-500 text-xs text-center mt-10">Sin items seleccionados</div>}
                   </div>
                </div>
             </div>

             <div className="pt-4 flex justify-end gap-3 mt-4">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                <button onClick={handleCreate} disabled={!supplierId || orderItems.length === 0} className="px-6 py-2 bg-blue-600 disabled:opacity-50 text-white font-bold rounded">Crear Orden</button>
             </div>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      {viewDetailId && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl p-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Detalle Orden {viewDetailId}</h3>
                  <button onClick={() => setViewDetailId(null)} className="text-slate-400 hover:text-white"><X size={24}/></button>
               </div>
               <div className="space-y-2 max-h-96 overflow-y-auto">
                  {purchaseOrders.find(po => po.id === viewDetailId)?.items.map(item => (
                     <div key={item.id} className="flex justify-between p-2 border-b border-slate-800 text-sm">
                        <span className="text-white">{item.name}</span>
                        <div className="text-right">
                           <div className="text-white">{item.quantity} un.</div>
                           <div className="text-emerald-400 text-xs">{formatCurrency(item.quantity * item.supplierPrice)}</div>
                        </div>
                     </div>
                  ))}
               </div>
               <div className="mt-4 pt-4 border-t border-slate-800 text-right">
                  <span className="text-slate-400 text-sm mr-2">Total:</span>
                  <span className="text-emerald-400 font-bold text-lg">
                     {formatCurrency(purchaseOrders.find(po => po.id === viewDetailId)?.total || 0)}
                  </span>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
