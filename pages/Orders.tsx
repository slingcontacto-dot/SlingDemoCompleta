
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, SERVICES_LIST, EMAIL_DOMAINS, Client, Sale, formatCurrency, formatDate, sendEmailSimulation } from '../types';
import { Plus, X, Calendar, DollarSign, Wrench, Search, UserPlus, UserCheck, CreditCard, ArrowRight } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export default function Orders() {
  const { orders, addOrder, updateOrder, updateOrderStatus, clients, addClient, addSale, deleteOrder } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  // Convert to Sale Modal
  const [isConvertToSaleOpen, setIsConvertToSaleOpen] = useState(false);
  const [orderToConvert, setOrderToConvert] = useState<Order | null>(null);
  const [invoiceType, setInvoiceType] = useState<'A' | 'B' | 'X'>('B');

  // Mode: 'existing' or 'new'
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');

  // Existing Client State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  
  // New Client State
  const [newClientFirstName, setNewClientFirstName] = useState('');
  const [newClientLastName, setNewClientLastName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  // Email Split (Used for both modes logic, but displayed/edited differently)
  const [emailUser, setEmailUser] = useState('');
  const [emailDomain, setEmailDomain] = useState(EMAIL_DOMAINS[0]);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [observations, setObservations] = useState('');

  // Filter clients for selection
  const filteredClients = clients.filter(c => 
    c.firstName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    c.lastName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  // When selecting an existing client, auto-fill email state
  useEffect(() => {
    if (clientMode === 'existing' && selectedClientId) {
      const c = clients.find(cli => String(cli.id) === selectedClientId);
      if (c && c.email) {
        const parts = c.email.split('@');
        if (parts.length === 2) {
           setEmailUser(parts[0]);
           setEmailDomain(`@${parts[1]}`);
        } else {
           setEmailUser(c.email);
           setEmailDomain('');
        }
      } else {
        setEmailUser('');
        setEmailDomain(EMAIL_DOMAINS[0]);
      }
    }
  }, [selectedClientId, clientMode, clients]);

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(prev => prev.filter(s => s !== service));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Resolve Client Data
    let finalClientName = '';
    let finalEmail = '';

    if (clientMode === 'existing') {
        const c = clients.find(cli => String(cli.id) === selectedClientId);
        if (!c) {
            alert("Por favor seleccione un cliente de la lista.");
            return;
        }
        finalClientName = `${c.lastName}, ${c.firstName}`;
        finalEmail = c.email;
    } else {
        // Register New Client
        if (!newClientFirstName || !newClientLastName) {
            alert("Complete nombre y apellido del cliente.");
            return;
        }
        finalEmail = emailUser ? `${emailUser}${emailDomain}` : '';
        
        const newClient: Client = {
            id: Date.now(), // Generate ID
            firstName: newClientFirstName,
            lastName: newClientLastName,
            email: finalEmail,
            phone: newClientPhone,
            address: newClientAddress,
            notes: 'Registrado desde Pedidos'
        };
        addClient(newClient); // Save to DB
        finalClientName = `${newClient.lastName}, ${newClient.firstName}`;
    }

    // 2. Calculate Services Total
    const servicesMap: Record<string, number> = {};
    let total = 0;
    
    selectedServices.forEach(s => {
      // @ts-ignore
      const price = SERVICES_LIST[s];
      servicesMap[s] = price;
      total += price;
    });

    // 3. Create Order
    const newOrder: Order = {
      id: Date.now(),
      date: new Date().toISOString(),
      client: finalClientName,
      email: finalEmail,
      status: 'Encargado',
      total,
      services: servicesMap,
      items: [], 
      observations,
      payments: []
    };

    addOrder(newOrder);
    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setClientMode('existing');
    setSelectedClientId('');
    setClientSearchTerm('');
    setNewClientFirstName('');
    setNewClientLastName('');
    setNewClientPhone('');
    setNewClientAddress('');
    setEmailUser('');
    setEmailDomain(EMAIL_DOMAINS[0]);
    setSelectedServices([]);
    setObservations('');
  };

  const handleStatusChange = (order: Order, newStatus: string) => {
      updateOrderStatus(order.id, newStatus);
      
      // Email Notification
      if (order.email) {
          sendEmailSimulation(
              order.email,
              `Actualización de Pedido #${order.id}`,
              `Estimado/a ${order.client},\n\nEl estado de su pedido ha sido actualizado a: ${newStatus}.\n\nAtentamente,\nSling ERP`
          );
      }

      if (newStatus === 'Entregado') {
          setOrderToConvert(order);
          setIsConvertToSaleOpen(true);
      }
  };

  const handleAddPayment = () => {
      if (!selectedOrderForPayment || paymentAmount <= 0) return;
      
      const updatedOrder = { ...selectedOrderForPayment };
      const newPayment = {
          date: new Date().toISOString(),
          amount: paymentAmount,
          method: paymentMethod
      };
      
      const newPayments = [...(updatedOrder.payments || []), newPayment];
      updateOrder(updatedOrder.id, { payments: newPayments });
      
      setIsPaymentModalOpen(false);
      setPaymentAmount(0);
      alert("Pago registrado correctamente.");
  };

  const handleConvertToSale = () => {
      if (!orderToConvert) return;

      const sale: Sale = {
          id: 0, // Auto-generated
          date: new Date().toISOString(),
          total: orderToConvert.total,
          subtotal: orderToConvert.total,
          client: orderToConvert.client,
          items: orderToConvert.items, // Assuming items are compatible
          paymentMethod: 'Multiple/Otro',
          type: invoiceType,
          discountApplied: undefined,
          surcharge: 0
      };

      const newId = addSale(sale);
      deleteOrder(orderToConvert.id); // Remove from Orders
      
      // Generate PDF (Same logic as SalesHistory)
      const doc = new jsPDF();

      // Title
      doc.setFontSize(22);
      doc.text(`FACTURA ${sale.type}`, 105, 20, { align: 'center' });
      
      // Header Info
      doc.setFontSize(10);
      doc.text(`Venta N°: ${newId}`, 14, 30);
      doc.text(`Fecha: ${formatDate(sale.date)}`, 14, 35);
      doc.text(`Cliente: ${sale.client}`, 14, 45);
      doc.text(`Pago: ${sale.paymentMethod}`, 14, 50);

      // Prepare items for table (include services)
      let tableRows = sale.items.map(item => [
         item.quantity,
         item.name,
         formatCurrency(item.price),
         formatCurrency(item.price * item.quantity)
      ]);
      
      // Add Services to table rows
      Object.entries(orderToConvert.services).forEach(([name, price]) => {
          tableRows.push([
              1,
              `Servicio: ${name}`,
              formatCurrency(price),
              formatCurrency(price)
          ]);
      });

      const tableColumn = ["Cant.", "Descripción", "P. Unit", "Total"];

      autoTable(doc, {
         startY: 60,
         head: [tableColumn],
         body: tableRows,
      });

      // Totals
      // @ts-ignore
      let finalY = doc.lastAutoTable.finalY + 10;
      
      doc.setFontSize(12);
      doc.text(`Subtotal: ${formatCurrency(sale.total)}`, 140, finalY);
      
      finalY += 10;
      doc.setFontSize(14);
      doc.text(`TOTAL: ${formatCurrency(sale.total)}`, 140, finalY);

      const fileName = `Factura-${invoiceType}-${newId}.pdf`;
      doc.save(fileName);

      // Simulate Email
      if(orderToConvert.email) {
          sendEmailSimulation(
              orderToConvert.email,
              `Factura de Compra #${newId}`,
              `Estimado/a,\n\nAdjuntamos su factura correspondiente al pedido finalizado.\n\nAtentamente,\nSling ERP`,
              fileName
          );
      }

      setIsConvertToSaleOpen(false);
      setOrderToConvert(null);
  };

  const generateWorkOrderPDF = (order: Order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("ORDEN DE TRABAJO (OT)", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`OT #: ${order.id}`, 20, 40);
    doc.text(`Fecha: ${formatDate(order.date)}`, 150, 40);
    
    doc.text(`Cliente: ${order.client}`, 20, 50);
    doc.text(`Email: ${order.email}`, 20, 60);

    // Services
    doc.setFontSize(16);
    doc.text("Servicios Requeridos", 20, 80);
    
    let y = 90;
    doc.setFontSize(12);
    Object.keys(order.services).forEach((service) => {
       doc.rect(20, y, 170, 10); // Checkbox box
       doc.text(service, 25, y + 7);
       doc.rect(160, y, 30, 10); // Status box empty
       y += 15;
    });

    // Blanks for manual entry
    y += 10;
    doc.setFontSize(16);
    doc.text("Detalles Técnicos (Completar en Taller)", 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text("Materiales Utilizados:", 20, y);
    doc.line(20, y+5, 190, y+5);
    doc.line(20, y+15, 190, y+15);
    doc.line(20, y+25, 190, y+25);

    y += 40;
    doc.text("Tiempo Insumido:", 20, y);
    doc.line(60, y, 120, y);

    y += 20;
    doc.text("Responsable:", 20, y);
    doc.line(50, y, 120, y);

    y += 20;
    doc.text("Observaciones Cliente:", 20, y);
    if(order.observations) {
        doc.setFont("helvetica", "italic");
        doc.text(order.observations, 20, y+10, { maxWidth: 170 });
    }

    doc.save(`OT-${order.id}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Encargado': return 'bg-yellow-900/50 text-yellow-400 border-yellow-800';
      case 'En Producción': return 'bg-blue-900/50 text-blue-400 border-blue-800';
      case 'Entregado': 
      case 'Listo para Entrega': return 'bg-green-900/50 text-green-400 border-green-800';
      case 'Cancelado': return 'bg-red-900/50 text-red-400 border-red-800';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Pedidos Especiales</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Pedido
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.slice().reverse().map(order => {
           const totalPaid = order.payments ? order.payments.reduce((acc, p) => acc + p.amount, 0) : 0;
           const remaining = order.total - totalPaid;

           return (
          <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-white text-lg">{order.client}</h3>
                <p className="text-slate-500 text-sm flex items-center gap-1">
                   <Calendar size={14} /> {formatDate(order.date)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
               {Object.entries(order.services).map(([name, price]) => (
                 <div key={name} className="flex justify-between text-sm">
                   <span className="text-slate-300">{name}</span>
                   <span className="text-slate-500">{formatCurrency(price)}</span>
                 </div>
               ))}
               {order.observations && (
                 <div className="bg-slate-950 p-3 rounded text-xs text-slate-400 italic">
                   "{order.observations}"
                 </div>
               )}
            </div>

            <div className="mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm">
                 <div className="flex justify-between mb-1">
                     <span className="text-slate-400">Total:</span>
                     <span className="text-white font-bold">{formatCurrency(order.total)}</span>
                 </div>
                 <div className="flex justify-between mb-1">
                     <span className="text-slate-400">Pagado:</span>
                     <span className="text-emerald-400">{formatCurrency(totalPaid)}</span>
                 </div>
                 <div className="flex justify-between border-t border-slate-800 pt-1 mt-1">
                     <span className="text-slate-400">Restante:</span>
                     <span className={`font-bold ${remaining > 0 ? 'text-red-400' : 'text-slate-500'}`}>{formatCurrency(remaining)}</span>
                 </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
               <div className="flex gap-2">
                   <button 
                     onClick={() => generateWorkOrderPDF(order)}
                     className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded"
                     title="Generar Orden de Trabajo"
                   >
                       <Wrench size={16} />
                   </button>
                   <button 
                     onClick={() => { setSelectedOrderForPayment(order); setIsPaymentModalOpen(true); }}
                     className="p-1.5 bg-emerald-900/50 hover:bg-emerald-900 text-emerald-400 rounded"
                     title="Registrar Pago"
                   >
                       <CreditCard size={16} />
                   </button>
               </div>
               
               <select 
                   className="bg-slate-950 border border-slate-700 rounded text-xs py-1 px-2 text-white focus:outline-none"
                   value={order.status}
                   onChange={(e) => handleStatusChange(order, e.target.value)}
                >
                    <option value="Encargado">Encargado</option>
                    <option value="En Producción">En Producción</option>
                    <option value="Listo para Entrega">Listo</option>
                    <option value="Entregado">Entregado (Finalizar)</option>
                    <option value="Cancelado">Cancelado</option>
                </select>
            </div>
          </div>
        )})}
        {orders.length === 0 && <div className="col-span-full text-center text-slate-500 py-20">No hay pedidos registrados</div>}
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Nuevo Pedido</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Client Selection Toggle */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-4">
                <button
                  type="button"
                  onClick={() => setClientMode('existing')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${clientMode === 'existing' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  <UserCheck size={16} /> Cliente Registrado
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('new')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${clientMode === 'new' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  <UserPlus size={16} /> Registrar Nuevo
                </button>
              </div>

              {/* CLIENT SECTION */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                {clientMode === 'existing' ? (
                  <div className="space-y-3">
                     <label className="block text-sm text-slate-400">Buscar Cliente</label>
                     <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input 
                           type="text"
                           className="w-full bg-slate-900 border border-slate-700 rounded pl-10 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
                           placeholder="Filtrar por nombre..."
                           value={clientSearchTerm}
                           onChange={e => setClientSearchTerm(e.target.value)}
                        />
                     </div>
                     <select 
                       className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                       value={selectedClientId}
                       onChange={e => setSelectedClientId(e.target.value)}
                       required
                       size={4}
                     >
                       <option value="" disabled>-- Seleccionar Cliente --</option>
                       {filteredClients.map(c => (
                         <option key={c.id} value={c.id}>{c.lastName}, {c.firstName} ({c.email})</option>
                       ))}
                     </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Nombre *</label>
                        <input required className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white" 
                          value={newClientFirstName} onChange={e => setNewClientFirstName(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Apellido *</label>
                        <input required className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white" 
                          value={newClientLastName} onChange={e => setNewClientLastName(e.target.value)} />
                      </div>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Email</label>
                        <div className="flex gap-1">
                           <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white flex-1 min-w-0" 
                              placeholder="usuario"
                              value={emailUser} onChange={e => setEmailUser(e.target.value)} />
                           <select className="bg-slate-900 border border-slate-700 rounded px-1 py-2 text-white w-32"
                              value={emailDomain} onChange={e => setEmailDomain(e.target.value)}
                           >
                              <option value="">(otro)</option>
                              {EMAIL_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                           </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Teléfono</label>
                        <input className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white" 
                          value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Dirección</label>
                        <input className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white" 
                          value={newClientAddress} onChange={e => setNewClientAddress(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SERVICES SECTION */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Servicios Requeridos</label>
                <div className="grid grid-cols-2 gap-2">
                   {Object.entries(SERVICES_LIST).map(([name, price]) => (
                     <button
                       key={name}
                       type="button"
                       onClick={() => toggleService(name)}
                       className={`text-left px-3 py-2 rounded text-sm border transition-all ${
                         selectedServices.includes(name) 
                           ? 'bg-blue-900/40 border-blue-600 text-blue-200' 
                           : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                       }`}
                     >
                       <div className="font-medium">{name}</div>
                       <div className="text-xs opacity-70">{formatCurrency(price)}</div>
                     </button>
                   ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Observaciones</label>
                <textarea className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white h-20" value={observations} onChange={e => setObservations(e.target.value)} />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={selectedServices.length === 0 || (clientMode === 'existing' && !selectedClientId) || (clientMode === 'new' && (!newClientFirstName || !newClientLastName))} 
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg"
                >
                  Confirmar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedOrderForPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm shadow-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Registrar Pago</h3>
                <p className="text-slate-400 text-sm mb-4">Pedido #{selectedOrderForPayment.id}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Monto ($)</label>
                        <input 
                            type="number" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                            value={paymentAmount} onChange={e => setPaymentAmount(parseFloat(e.target.value))}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Medio de Pago</label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                            value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Débito">Débito</option>
                            <option value="Crédito">Crédito</option>
                        </select>
                    </div>
                    <button onClick={handleAddPayment} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded">
                        Registrar
                    </button>
                    <button onClick={() => setIsPaymentModalOpen(false)} className="w-full text-slate-500 py-2">Cancelar</button>
                </div>
            </div>
          </div>
      )}

      {/* Convert to Sale Modal */}
      {isConvertToSaleOpen && orderToConvert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl p-6">
                <div className="text-center mb-6">
                   <div className="bg-green-900/30 text-green-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                       <ArrowRight size={24} />
                   </div>
                   <h3 className="text-xl font-bold text-white">Finalizar Venta</h3>
                   <p className="text-slate-400 text-sm mt-2">
                       El pedido ha sido entregado. ¿Desea generar la factura correspondiente?
                   </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg mb-6 border border-slate-800">
                    <div className="flex justify-between mb-2">
                        <span className="text-slate-400">Cliente</span>
                        <span className="text-white font-medium">{orderToConvert.client}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Total</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(orderToConvert.total)}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Tipo de Comprobante</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['A', 'B', 'X'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setInvoiceType(type as any)}
                                    className={`py-2 rounded border ${
                                        invoiceType === type 
                                        ? 'bg-blue-600 border-blue-500 text-white' 
                                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                                    }`}
                                >
                                    Factura {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setIsConvertToSaleOpen(false)} className="py-3 rounded border border-slate-700 text-slate-400 hover:text-white">
                            Solo guardar
                        </button>
                        <button onClick={handleConvertToSale} className="py-3 rounded bg-green-600 hover:bg-green-500 text-white font-bold">
                            Generar Venta
                        </button>
                    </div>
                </div>
            </div>
          </div>
      )}
    </div>
  );
}
