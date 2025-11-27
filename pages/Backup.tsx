
import React from 'react';
import { useApp } from '../context/AppContext';
import { Download, Upload, AlertTriangle, Database } from 'lucide-react';

export default function Backup() {
  const { exportData, importData } = useApp();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nouvelles_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        if (confirm("ADVERTENCIA: Esto sobrescribirá todos los datos actuales con los del archivo de respaldo. ¿Estás seguro?")) {
           importData(json);
           alert("Datos restaurados exitosamente.");
        }
      } catch (error) {
        alert("Error al leer el archivo de respaldo. Asegúrese de que sea un JSON válido.");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-white">Respaldo y Restauración</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Export Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center text-center space-y-4">
             <div className="p-4 bg-blue-900/30 rounded-full text-blue-400 mb-2">
                <Download size={48} />
             </div>
             <h3 className="text-xl font-bold text-white">Exportar Datos</h3>
             <p className="text-slate-400">
                Descarga una copia completa de la base de datos (Inventario, Ventas, Clientes, etc.) en formato JSON.
             </p>
             <button 
                onClick={handleDownload}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all"
             >
                <Database size={18} />
                Descargar Backup
             </button>
          </div>

          {/* Import Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center text-center space-y-4">
             <div className="p-4 bg-amber-900/30 rounded-full text-amber-400 mb-2">
                <Upload size={48} />
             </div>
             <h3 className="text-xl font-bold text-white">Restaurar Datos</h3>
             <p className="text-slate-400">
                Sube un archivo de respaldo (.json) para restaurar el sistema a un estado anterior.
             </p>
             
             <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded text-amber-200 text-xs flex items-start gap-2 text-left">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>Advertencia: Esta acción eliminará los datos actuales y los reemplazará con los del archivo.</span>
             </div>

             <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden" 
             />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all"
             >
                <Upload size={18} />
                Seleccionar Archivo
             </button>
          </div>
       </div>
    </div>
  );
}
