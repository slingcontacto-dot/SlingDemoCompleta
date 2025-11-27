
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, CartItem, CATEGORIES, PAYMENT_METHODS, Discount, formatCurrency, sendEmailSimulation } from '../types';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle, User as UserIcon, Tag, Percent, FileText } from 'lucide-react';

export default function POS() {
  const { products, addSale, clients, discounts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [invoiceType, setInvoiceType] = useState<'A' | 'B' | 'X'>('B');
  
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
    alert(`Venta registrada exitosamente! (ID: ${saleId})`);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex gap-4">
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
             className="bg-slate-950 border border-slate-700 rounded-lg px-4 text-white focus:outline-none focus:border-blue-500"
             value={filterCat}
             onChange={e => setFilterCat(e.target.value)}
          >
             <option value="All">Todas</option>
             {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-900 p-4 rounded-xl border border-slate-800">
          {/* Change: grid-cols-4 removed, max is now grid-cols-3 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map(p => (
              <button 
                key={p.id}
                onClick={() => addToCart(p)}
                className="flex flex-col h-full justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500 transition-all text-left group"
              >
                <div className="w-full">
                  <div className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">{p.name}</div>
                  <div className="text-xs text-slate-500 mb-2">{p.category}</div>
                </div>
                <div className="mt-2 flex justify-between items-end w-full border-t border-slate-800 pt-2">
                  <span className="text-emerald-400 font-mono text-lg font-bold">{formatCurrency(p.price)}</span>
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">{p.stock} un.</span>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">No se encontraron productos</div>}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <ShoppingCart size={20} />
            Carrito Actual
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-sm font-medium text-white truncate">{item.name}</div>
                <div className="text-xs text-emerald-400 font-mono">{formatCurrency(item.price * item.quantity)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Minus size={14}/></button>
                <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Plus size={14}/></button>
                <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-400 hover:text-red-300"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {cart.length === 0 && <div className="text-center text-slate-500 py-10 italic">El carrito está vacío</div>}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-xs text-slate-500 block mb-1 flex items-center gap-1"><UserIcon size={10}/> Cliente</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.lastName}, {c.firstName}</option>)}
                </select>
             </div>
             <div>
                <label className="text-xs text-slate-500 block mb-1">Pago</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                   {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
              <div>
                  <label className="text-xs text-slate-500 block mb-1 flex items-center gap-1"><Tag size={10}/> Descuento</label>
                  <select 
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      value={selectedDiscountId}
                      onChange={e => setSelectedDiscountId(e.target.value)}
                  >
                      <option value="">Ninguno</option>
                      {activeDiscounts.map(d => (
                         <option key={d.id} value={d.id}>
                            {d.name} ({d.type === 'percentage' ? `${d.value}%` : `$${d.value}`})
                         </option>
                      ))}
                  </select>
              </div>
              <div>
                  <label className="text-xs text-slate-500 block mb-1 flex items-center gap-1"><Percent size={10}/> Recargo</label>
                  <div className="flex gap-1">
                      <select 
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-xs text-white"
                        value={surchargeType}
                        onChange={e => setSurchargeType(e.target.value as any)}
                      >
                         <option value="percentage">%</option>
                         <option value="fixed">$</option>
                      </select>
                      <input 
                         type="number" min="0" 
                         className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                         value={surchargeValue}
                         onChange={e => setSurchargeValue(parseFloat(e.target.value) || 0)}
                      />
                  </div>
              </div>
          </div>
          
          {/* Invoice Type Selection */}
          <div>
            <label className="text-xs text-slate-500 block mb-1 flex items-center gap-1"><FileText size={10}/> Tipo Factura</label>
            <div className="grid grid-cols-3 gap-2">
                {['A', 'B', 'X'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setInvoiceType(type as any)}
                        className={`py-1 rounded border text-sm ${
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

          <div className="pt-2 border-t border-slate-800 space-y-1">
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-300">{formatCurrency(subtotal)}</span>
             </div>
             {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                   <span className="text-green-500">Descuento</span>
                   <span className="text-green-500">-{formatCurrency(discountAmount)}</span>
                </div>
             )}
             {surchargeAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                   <span className="text-red-400">Recargo</span>
                   <span className="text-red-400">+{formatCurrency(surchargeAmount)}</span>
                </div>
             )}
             <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400 font-bold">Total</span>
                <span className="text-2xl font-bold text-white">{formatCurrency(total)}</span>
             </div>
          </div>

          <button 
             onClick={handleCheckout}
             disabled={cart.length === 0}
             className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-all"
          >
             <CheckCircle size={20} />
             Finalizar Venta
          </button>
        </div>
      </div>
    </div>
  );
}
