
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sale, formatCurrency, formatDate, sendEmailSimulation } from '../types';
import { Search, Printer, Calendar, User } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export default function SalesHistory() {
  const { sales, clients } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales.filter(s => 
     String(s.id).includes(searchTerm) || 
     s.client.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.id - a.id); // Newest first

  const generateInvoice = (sale: Sale) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.text(`FACTURA ${sale.type}`, 105, 20, { align: 'center' });
    
    // Header Info
    doc.setFontSize(10);
    doc.text(`Venta N°: ${sale.id}`, 14, 30);
    doc.text(`Fecha: ${formatDate(sale.date)}`, 14, 35);
    doc.text(`Cliente: ${sale.client}`, 14, 45);
    doc.text(`Pago: ${sale.paymentMethod}`, 14, 50);

    // Table
    const tableColumn = ["Cant.", "Descripción", "P. Unit", "Total"];
    const tableRows = sale.items.map(item => [
       item.quantity,
       item.name,
       formatCurrency(item.price),
       formatCurrency(item.price * item.quantity)
    ]);

    autoTable(doc, {
       startY: 60,
       head: [tableColumn],
       body: tableRows,
    });

    // Totals
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(12);
    doc.text(`Subtotal: ${formatCurrency(sale.items.reduce((acc, i) => acc + (i.price * i.quantity), 0))}`, 140, finalY);
    
    if (sale.discountApplied) {
       finalY += 7;
       doc.setTextColor(0, 150, 0);
       doc.text(`Descuento (${sale.discountApplied.name}): -${formatCurrency(sale.discountApplied.amount)}`, 140, finalY);
       doc.setTextColor(0, 0, 0);
    }

    if (sale.surcharge && sale.surcharge > 0) {
        finalY += 7;
        doc.setTextColor(200, 0, 0);
        doc.text(`Recargo: +${formatCurrency(sale.surcharge)}`, 140, finalY);
        doc.setTextColor(0, 0, 0);
    }
    
    finalY += 10;
    doc.setFontSize(14);
    doc.text(`TOTAL: ${formatCurrency(sale.total)}`, 140, finalY);

    const fileName = `Factura-${sale.id}.pdf`;
    doc.save(fileName);

    // Email logic for re-generated invoices
    // Try to find email from client list by matching name string (since sale doesn't store ID/email directly in this iteration)
    // In a real app, Sale should store clientId. Here we do best effort match.
    const clientFound = clients.find(c => `${c.lastName}, ${c.firstName}` === sale.client);
    if(clientFound?.email) {
        sendEmailSimulation(
            clientFound.email,
            `Copia de Factura #${sale.id}`,
            `Adjuntamos la copia solicitada de su comprobante.\n\nAtentamente,\nSling ERP`,
            fileName
        );
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Historial de Ventas</h2>

      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative">
        <Search className="absolute left-7 top-6.5 text-slate-500" size={20} />
        <input 
          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
          placeholder="Buscar por N° Venta o Cliente..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
               <tr>
                 <th className="px-6 py-4">N°</th>
                 <th className="px-6 py-4">Fecha</th>
                 <th className="px-6 py-4">Cliente</th>
                 <th className="px-6 py-4 text-center">Items</th>
                 <th className="px-6 py-4 text-center">Tipo</th>
                 <th className="px-6 py-4 text-right">Total</th>
                 <th className="px-6 py-4 text-center">Acciones</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-800">
               {filteredSales.map(sale => (
                 <tr key={sale.id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-mono text-sm text-slate-400">{sale.id}</td>
                    <td className="px-6 py-4 text-sm text-white">
                       <div className="flex items-center gap-2"><Calendar size={14}/> {formatDate(sale.date)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                       <div className="flex items-center gap-2"><User size={14}/> {sale.client}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400 text-sm">
                       {sale.items.reduce((acc, i) => acc + i.quantity, 0)}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-bold">{sale.type}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-400">
                       {formatCurrency(sale.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button 
                          onClick={() => generateInvoice(sale)}
                          className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 p-2 rounded transition-colors"
                          title="Imprimir Factura"
                       >
                          <Printer size={18} />
                       </button>
                    </td>
                 </tr>
               ))}
               {filteredSales.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-500">No se encontraron ventas.</td></tr>
               )}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
