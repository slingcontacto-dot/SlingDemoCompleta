
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  FileText, 
  LogOut,
  Menu,
  X,
  Search,
  Percent,
  Archive,
  UserCog,
  ClipboardList,
  History
} from 'lucide-react';

// Pages imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Clients from './pages/Clients';
import PurchaseOrders from './pages/PurchaseOrders';
import Discounts from './pages/Discounts';
import UsersAdmin from './pages/UsersAdmin';
import GlobalSearch from './pages/GlobalSearch';
import Backup from './pages/Backup';
import SalesHistory from './pages/SalesHistory';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

const SidebarSection = ({ title }: { title: string }) => (
  <div className="px-4 mt-6 mb-2">
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
  </div>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) return <Navigate to="/login" />;

  // Permission Logic
  const isOwner = user.role === 'owner';
  const isTaller = user.username.toLowerCase() === 'taller'; // Special check for Taller
  // Vendedor (or others) is implied if !isOwner && !isTaller

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header with Global Search Icon */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Sling
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider">Sistema completo</p>
            </div>
            <Link 
              to="/search" 
              className={`p-2 rounded-lg transition-colors ${location.pathname === '/search' ? 'text-blue-400 bg-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title="Búsqueda Global"
            >
              <Search size={20} />
            </Link>
          </div>
          
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            
            {/* All Roles see Dashboard & Inventory */}
            <SidebarLink to="/" icon={LayoutDashboard} label="Panel de Control" active={location.pathname === '/'} />
            <SidebarLink to="/inventory" icon={Package} label="Inventario" active={location.pathname === '/inventory'} />

            {/* Ventas Group */}
            <SidebarSection title="Ventas" />
            
            {/* TPV: Owner & Vendedor only (Taller hidden) */}
            {!isTaller && (
              <SidebarLink to="/pos" icon={ShoppingCart} label="TPV (Caja)" active={location.pathname === '/pos'} />
            )}

            {/* Historial: Owner & Vendedor only */}
            {!isTaller && (
              <SidebarLink to="/sales-history" icon={History} label="Historial Ventas" active={location.pathname === '/sales-history'} />
            )}

            {/* Pedidos: All Roles (Taller uses this heavily) */}
            <SidebarLink to="/orders" icon={FileText} label="Pedidos" active={location.pathname === '/orders'} />
            
            {/* Descuentos: Owner & Vendedor only */}
            {!isTaller && (
              <SidebarLink to="/discounts" icon={Percent} label="Descuentos" active={location.pathname === '/discounts'} />
            )}

            {/* Gestión Group - All Roles (As per request "Taller a inventario, gestión y pedidos") */}
            <SidebarSection title="Gestión" />
            <SidebarLink to="/clients" icon={Users} label="Clientes" active={location.pathname === '/clients'} />
            <SidebarLink to="/suppliers" icon={Truck} label="Proveedores" active={location.pathname === '/suppliers'} />
            <SidebarLink to="/purchase-orders" icon={ClipboardList} label="Compras" active={location.pathname === '/purchase-orders'} />

            {/* Admin Group - Owner Only */}
            {isOwner && (
              <>
                <SidebarSection title="Admin" />
                <SidebarLink to="/users" icon={UserCog} label="Usuarios" active={location.pathname === '/users'} />
                <SidebarLink to="/backup" icon={Archive} label="Backup" active={location.pathname === '/backup'} />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-800">
             <div className="flex items-center justify-between mb-4 px-2">
                <div>
                   <p className="text-sm font-semibold text-white">{user.username}</p>
                   <p className="text-xs text-slate-500 capitalize">{user.role === 'owner' ? 'Dueño' : 'Empleado'}</p>
                </div>
             </div>
            <button 
              onClick={logout}
              className="flex w-full items-center space-x-3 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
           <h1 className="text-xl font-bold text-white">Sling ERP</h1>
           <div className="flex items-center gap-2">
             <Link to="/search" className="text-slate-400 p-2"><Search size={20}/></Link>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
               {mobileMenuOpen ? <X /> : <Menu />}
             </button>
           </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
           {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><GlobalSearch /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
          <Route path="/sales-history" element={<ProtectedRoute><SalesHistory /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
          <Route path="/discounts" element={<ProtectedRoute><Discounts /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersAdmin /></ProtectedRoute>} />
          <Route path="/backup" element={<ProtectedRoute><Backup /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
