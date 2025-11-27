
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, CartItem, CATEGORIES, PAYMENT_METHODS, Discount, formatCurrency, sendEmailSimulation } from '../types';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle, User as UserIcon, Tag, Percent, FileText, X, ArrowUp } from 'lucide-react';

export default function POS() {
  const { products, addSale, clients, discounts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [invoiceType, setInvoiceType] = useState<'A' | 'B' | 'X'>('B');
  
  // UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Client State
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  // Discount State
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>('');

  // Surcharge State
  const [surchargeType, setSurchargeType] = useState<'percentage' | 'fixed'>('percentage');
  const [surchargeValue, setSurchargeValue] = useState<number>(0);

  const filteredProducts = products.filter(p => {
    return (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           p.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
           (filterCat === 'All' || p.category === filterCat) &&
           p.stock > 0;
  });

  const activeDiscounts = discounts.filter(d => d.active);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Stock limit
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQty = Math.max(1, Math.min(item.quantity + delta, product ? product.stock : 999));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Totals Calculation
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  const selectedDiscount = activeDiscounts.find(d => String(d.id) === selectedDiscountId);
  if (selectedDiscount) {
     if (selectedDiscount.type === 'percentage') {
        discountAmount = subtotal * (selectedDiscount.value / 100);
     } else {
        discountAmount = selectedDiscount.value;
     }
  }

  // Surcharge Calculation
  let surchargeAmount = 0;
  if (surchargeValue > 0) {
      if (surchargeType === 'percentage') {
          surchargeAmount = subtotal * (surchargeValue / 100);
      } else {
          surchargeAmount = surchargeValue;
      }
  }

  const total = Math.max(0, subtotal - discountAmount + surchargeAmount);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!selectedClientId) {
      alert("Seleccione un cliente");
      return;
    }

    const client = clients.find(c => String(c.id) === selectedClientId);

    const saleId = addSale({
      id: 0, // ID is auto-generated in context, returns correct ID
      date: new Date().toISOString(),
      total,
      subtotal,
      client: client ? `${client.lastName}, ${client.firstName}` : 'Consumidor Final',
      items: [...cart],
      paymentMethod,
      type: invoiceType,
      discountApplied: selectedDiscount ? { name: selectedDiscount.name, amount: discountAmount } : undefined,
      surcharge: surchargeAmount
    });
    
    // Simulate Email Sending
    if(client?.email) {
        sendEmailSimulation(
            client.email,
            `Comprobante de Venta #${saleId}`,
            `Gracias por su compra. Adjuntamos el detalle de su transacción.\nTotal: ${formatCurrency(total)}\n\nAtentamente,\nSling ERP`,
            `Ticket-Venta-${saleId}.pdf`
        );
    }

    // Reset
    setCart([]);
    setSelectedClientId('');
    setSelectedDiscountId('');
    setSurchargeValue(0);
    setInvoiceType('B');
    setIsCartOpen(false); // Close modal
    alert(`Venta registrada exitosamente! (ID: ${saleId})`);
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* --- HEADER FILTERS --- */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 mb-4 sticky top-0 z-10 shadow-lg">
        <div className="relative flex-1">
           <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
           <input 
             className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
             placeholder="Buscar producto..."
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <select 
           className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
           value={filterCat}
           onChange={e => setFilterCat(e.target.value)}
        >
           <option value="All">Todas las Categorías</option>
           {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div className="flex-1 overflow-y-auto pb-24"> 
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <button 
              key={p.id}
              onClick={() => addToCart(p)}
              className="flex flex-col h-full justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500 transition-all text-left group hover:shadow-lg hover:bg-slate-800"
            >
              <div className="w-full">
                <div className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">{p.name}</div>
                <div className="text-xs text-slate-500 mb-2">{p.category}</div>
              </div>
              <div className="mt-2 flex justify-between items-end w-full border-t border-slate-800 pt-2">
                <span className="text-emerald-400 font-mono text-xl font-bold">{formatCurrency(p.price)}</span>
                <span className="text-xs bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">{p.stock} un.</span>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">No se encontraron productos</div>}
        </div>
      </div>

      {/* --- BOTTOM FLOATING BAR --- */}
      <div className="fixed bottom-4 left-4 right-4 md:left-64 md:right-8 bg-slate-900/95 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-2xl z-30 flex justify-between items-center">
         <div className="flex items-center gap-4">
             <div className="bg-slate-800 p-3 rounded-full relative">
                 <ShoppingCart className="text-blue-400" size={24} />
                 {cart.length > 0 && (
                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {cart.reduce((acc, i) => acc + i.quantity, 0)}
                     </span>
                 )}
             </div>
             <div className="flex flex-col">
                 <span className="text-slate-400 text-xs uppercase font-bold">Total Estimado</span>
                 <span className="text-white text-2xl font-bold">{formatCurrency(total)}</span>
             </div>
         </div>
         <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-900/40 flex items-center gap-2 transition-transform active:scale-95"
         >
            Ver Carrito <ArrowUp size={20} />
         </button>
      </div>

      {/* --- CART MODAL (Splitted Columns) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           {/* Wide Modal */}
           <div className="w-full max-w-7xl bg-slate-900 h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                  <div className="flex items-center gap-3">
                      <ShoppingCart className="text-blue-500" size={24} />
                      <h2 className="text-xl font-bold text-white">Procesar Venta</h2>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                      <X size={24} />
                  </button>
              </div>

              {/* Main Content: Split View */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* COL 1: PRODUCTS LIST */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-900 lg:border-r border-slate-800">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Productos Agregados ({cart.length})</h3>
                   
                   <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors">
                            <div className="flex-1">
                                <h4 className="font-bold text-white text-base mb-1">{item.name}</h4>
                                <div className="text-sm text-slate-500 font-mono">
                                    {formatCurrency(item.price)} x un.
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Qty */}
                                <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Minus size={16}/></button>
                                    <span className="text-sm font-bold w-6 text-center text-white">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Plus size={16}/></button>
                                </div>

                                {/* Subtotal */}
                                <div className="text-right min-w-[100px]">
                                    <div className="text-base font-bold text-emerald-400 font-mono">
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </div>

                                <button onClick={() => removeFromCart(item.id)} className="text-slate-600 hover:text-red-500 transition-colors p-2">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                      ))}
                      
                      {cart.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                            <ShoppingCart size={48} className="opacity-20" />
                            <p>El carrito está vacío</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* COL 2: CHECKOUT DETAILS */}
                <div className="w-full lg:w-[400px] bg-slate-950 flex flex-col border-l border-slate-800">
                    {/* Scrollable Form Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1.5 font-bold uppercase"><UserIcon size={12} className="inline mr-1"/> Cliente</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                                    value={selectedClientId}
                                    onChange={e => setSelectedClientId(e.target.value)}
                                >
                                    <option value="">Seleccionar Cliente...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.lastName}, {c.firstName}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 block mb-1.5 font-bold uppercase">Pago</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                >
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1.5 font-bold uppercase"><Tag size={12} className="inline mr-1"/> Descuento</label>
                                    <select 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                                        value={selectedDiscountId}
                                        onChange={e => setSelectedDiscountId(e.target.value)}
                                    >
                                        <option value="">-</option>
                                        {activeDiscounts.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} ({d.type === 'percentage' ? `${d.value}%` : `$${d.value}`})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1.5 font-bold uppercase"><Percent size={12} className="inline mr-1"/> Recargo</label>
                                    <div className="flex gap-1">
                                        <select 
                                            className="w-14 bg-slate-900 border border-slate-700 rounded-l-lg px-1 py-2.5 text-white text-sm"
                                            value={surchargeType}
                                            onChange={e => setSurchargeType(e.target.value as any)}
                                        >
                                            <option value="percentage">%</option>
                                            <option value="fixed">$</option>
                                        </select>
                                        <input 
                                            type="number" min="0" 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-r-lg px-2 py-2.5 text-white text-sm"
                                            value={surchargeValue}
                                            onChange={e => setSurchargeValue(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 block mb-1.5 font-bold uppercase"><FileText size={12} className="inline mr-1"/> Factura</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['A', 'B', 'X'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setInvoiceType(type as any)}
                                            className={`py-2 rounded border text-sm font-bold transition-colors ${
                                                invoiceType === type 
                                                ? 'bg-blue-600 border-blue-500 text-white' 
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Bottom Summary */}
                    <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="text-slate-300 font-mono">{formatCurrency(subtotal)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-500">
                                    <span>Descuento</span>
                                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            {surchargeAmount > 0 && (
                                <div className="flex justify-between text-red-400">
                                    <span>Recargo</span>
                                    <span className="font-mono">+{formatCurrency(surchargeAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t border-slate-800 mt-2">
                                <span className="text-white font-bold text-lg">Total</span>
                                <span className="text-2xl font-bold text-emerald-400 font-mono">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                        >
                            <CheckCircle size={20} />
                            Confirmar Venta
                        </button>
                    </div>
                </div>

              </div>
           </div>
        </div>
      )}
    </div>
  );
}
