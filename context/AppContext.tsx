
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Sale, Supplier, Order, Client, PurchaseOrder, Discount } from '../types';

interface AppContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  
  // User Admin
  usersList: User[];
  addUser: (u: User) => void;
  updateUser: (id: number, u: Partial<User>) => void;
  deleteUser: (id: number) => void;
  
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  sales: Sale[];
  addSale: (s: Sale) => void;
  
  clients: Client[];
  addClient: (c: Client) => void;
  updateClient: (id: number, c: Partial<Client>) => void;
  deleteClient: (id: number) => void;

  suppliers: Supplier[];
  addSupplier: (s: Supplier) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  orders: Order[]; // Custom Customer Orders
  addOrder: (o: Order) => void;
  updateOrder: (id: number, o: Partial<Order>) => void;
  updateOrderStatus: (id: number, status: string) => void;
  deleteOrder: (id: number) => void;

  purchaseOrders: PurchaseOrder[]; // Supplier Orders
  addPurchaseOrder: (po: PurchaseOrder) => void;
  updatePurchaseOrderStatus: (id: string, status: 'Pendiente' | 'Recibida' | 'Cancelada') => void;

  discounts: Discount[];
  addDiscount: (d: Discount) => void;
  updateDiscount: (id: number, d: Partial<Discount>) => void;
  toggleDiscount: (id: number) => void;
  deleteDiscount: (id: number) => void;

  // Backup
  importData: (jsonData: string) => void;
  exportData: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get dates relative to today
const getDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

// --- INITIAL MOCK DATA ---

const INITIAL_USERS: User[] = [
  { id: 1, username: 'dueño', role: 'owner', password: '123123' }, 
  { id: 2, username: 'vendedor', role: 'employee', password: '123' },
  { id: 3, username: 'taller', role: 'employee', password: '123' }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'P-0001', name: 'Silla de Roble Clásica', category: 'Muebles', price: 45000, stock: 12, supplier: 'Maderas del Sur', supplierPrice: 22000 },
  { id: 'P-0002', name: 'Mesa Ratona Industrial', category: 'Muebles', price: 65000, stock: 4, supplier: 'Hierros & Madera', supplierPrice: 35000 },
  { id: 'P-0003', name: 'Sillón Chenille 3 Cuerpos', category: 'Muebles', price: 350000, stock: 2, supplier: 'Textiles Unidos', supplierPrice: 180000 },
  { id: 'P-0004', name: 'Lámpara LED Colgante', category: 'Electrónica', price: 18500, stock: 25, supplier: 'ElectroGlobal SA', supplierPrice: 9000 },
  { id: 'P-0005', name: 'Tira LED RGB 5m', category: 'Electrónica', price: 12000, stock: 50, supplier: 'ElectroGlobal SA', supplierPrice: 5500 },
  { id: 'P-0006', name: 'Fuente 12V 5A', category: 'Electrónica', price: 8500, stock: 15, supplier: 'ElectroGlobal SA', supplierPrice: 4000 },
  { id: 'P-0007', name: 'Barniz Marino 1L', category: 'Materia Prima', price: 10500, stock: 8, supplier: 'Maderas del Sur', supplierPrice: 6000 },
  { id: 'P-0008', name: 'Pack Tornillos x100', category: 'Materia Prima', price: 3500, stock: 100, supplier: 'Hierros & Madera', supplierPrice: 1200 },
  { id: 'P-0009', name: 'Servicio de Instalación', category: 'Servicios', price: 25000, stock: 999, supplier: 'Interno', supplierPrice: 0 },
  { id: 'P-0010', name: 'Escritorio Gamer Pro', category: 'Muebles', price: 120000, stock: 0, supplier: 'Maderas del Sur', supplierPrice: 60000 }, // Stock 0 for alert
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'PR-0001', name: 'Maderas del Sur', rubro: 'Maderas', phone: '11-4455-6677', email: 'ventas@maderasur.com', address: 'Av. Forestal 123' },
  { id: 'PR-0002', name: 'ElectroGlobal SA', rubro: 'Electrónica', phone: '11-5566-7788', email: 'contacto@electroglobal.com', address: 'Calle Tecnológica 404' },
  { id: 'PR-0003', name: 'Hierros & Madera', rubro: 'Insumos', phone: '11-2233-4455', email: 'pedidos@hyma.com', address: 'Ruta 8 Km 50' },
  { id: 'PR-0004', name: 'Textiles Unidos', rubro: 'Telas', phone: '11-9988-7766', email: 'info@textiles.com', address: 'San Martín 500' },
];

const INITIAL_CLIENTS: Client[] = [
  { id: 1, firstName: 'Juan', lastName: 'Perez', email: 'juan.perez@gmail.com', phone: '11-1234-5678', address: 'Calle Falsa 123' },
  { id: 2, firstName: 'Maria', lastName: 'Gonzalez', email: 'mgonzalez@hotmail.com', phone: '11-8765-4321', address: 'Av. Libertador 2000' },
  { id: 3, firstName: 'Carlos', lastName: 'Ruiz', email: 'cruiz@outlook.com', phone: '11-1122-3344', address: 'Barrio Norte 5' },
  { id: 4, firstName: 'Ana', lastName: 'Lopez', email: 'ana.lopez@yahoo.com', phone: '11-9988-1122', address: 'San Telmo 45' },
];

const INITIAL_DISCOUNTS: Discount[] = [
  { id: 1, name: 'Efectivo', type: 'percentage', value: 10, active: true },
  { id: 2, name: 'Promo Verano', type: 'fixed', value: 5000, active: true },
  { id: 3, name: 'Cliente VIP', type: 'percentage', value: 20, active: false },
];

const INITIAL_SALES: Sale[] = [
  { 
    id: 1001, date: getDate(0), total: 45000, subtotal: 45000, client: 'Perez, Juan', paymentMethod: 'Efectivo', type: 'B', items: [
      { ...INITIAL_PRODUCTS[0], quantity: 1 }
    ], surcharge: 0
  },
  { 
    id: 1002, date: getDate(0), total: 18500, subtotal: 18500, client: 'Consumidor Final', paymentMethod: 'QR', type: 'B', items: [
      { ...INITIAL_PRODUCTS[3], quantity: 1 }
    ], surcharge: 0
  },
  { 
    id: 1003, date: getDate(1), total: 70000, subtotal: 70000, client: 'Gonzalez, Maria', paymentMethod: 'Transferencia', type: 'A', items: [
      { ...INITIAL_PRODUCTS[2], quantity: 2 }
    ], surcharge: 0
  },
  { 
    id: 1004, date: getDate(2), total: 12000, subtotal: 12000, client: 'Consumidor Final', paymentMethod: 'Efectivo', type: 'B', items: [
      { ...INITIAL_PRODUCTS[4], quantity: 1 }
    ], surcharge: 0
  },
  { 
    id: 1005, date: getDate(4), total: 130000, subtotal: 130000, client: 'Ruiz, Carlos', paymentMethod: 'Crédito', type: 'A', items: [
      { ...INITIAL_PRODUCTS[1], quantity: 2 }
    ], surcharge: 0
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 5001, date: getDate(1), client: 'Lopez, Ana', email: 'ana.lopez@yahoo.com', status: 'Encargado', total: 60000,
    services: { 'Carpintería': 5000 },
    items: [{ ...INITIAL_PRODUCTS[0], quantity: 2 }], // 2 Sillas + Carpinteria
    observations: 'Pintar de color caoba oscuro',
    payments: []
  },
  {
    id: 5002, date: getDate(3), client: 'Perez, Juan', email: 'juan.perez@gmail.com', status: 'En Producción', total: 355000,
    services: { 'Tapicería': 4000, 'Embalaje': 1500 },
    items: [{ ...INITIAL_PRODUCTS[2], quantity: 1 }],
    observations: 'Tela entregada por el cliente',
    payments: [{ date: getDate(3), amount: 150000, method: 'Efectivo' }]
  },
  {
    id: 5003, date: getDate(10), client: 'Gonzalez, Maria', email: 'mgonzalez@hotmail.com', status: 'Entregado', total: 25000,
    services: { 'Instalación': 2500 },
    items: [{ ...INITIAL_PRODUCTS[3], quantity: 1 }],
    observations: '',
    payments: [{ date: getDate(10), amount: 25000, method: 'Transferencia' }]
  }
];

const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'OC-1710001', date: getDate(5), supplierId: 'PR-0001', status: 'Recibida', total: 440000,
    items: [
       { ...INITIAL_PRODUCTS[0], quantity: 10 },
       { ...INITIAL_PRODUCTS[9], quantity: 5 } // Escritorios (restocked previously)
    ]
  },
  {
    id: 'OC-1710002', date: getDate(1), supplierId: 'PR-0002', status: 'Pendiente', total: 45000,
    items: [
       { ...INITIAL_PRODUCTS[3], quantity: 5 }
    ]
  }
];

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  // --- Auth & Users ---
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('erp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('erp_users_list');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // --- Data States ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('erp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('erp_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('erp_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('erp_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('erp_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('erp_purchase_orders');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [discounts, setDiscounts] = useState<Discount[]>(() => {
    const saved = localStorage.getItem('erp_discounts');
    return saved ? JSON.parse(saved) : INITIAL_DISCOUNTS;
  });

  // --- Persistence Effects ---
  useEffect(() => { localStorage.setItem('erp_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('erp_users_list', JSON.stringify(usersList)); }, [usersList]);
  useEffect(() => { localStorage.setItem('erp_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('erp_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('erp_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('erp_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('erp_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('erp_purchase_orders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('erp_discounts', JSON.stringify(discounts)); }, [discounts]);

  // --- Actions ---

  // Auth
  const login = (u: User) => {
    setUser(u);
  };
  const logout = () => setUser(null);
  
  // User Admin
  const addUser = (u: User) => setUsersList([...usersList, u]);
  const updateUser = (id: number, u: Partial<User>) => {
    setUsersList(usersList.map(usr => usr.id === id ? { ...usr, ...u } : usr));
  };
  const deleteUser = (id: number) => setUsersList(usersList.filter(u => u.id !== id));

  // Products
  const addProduct = (p: Product) => setProducts([...products, p]);
  const updateProduct = (id: string, p: Partial<Product>) => {
    setProducts(products.map(prod => prod.id === id ? { ...prod, ...p } : prod));
  };
  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Sales
  const addSale = (s: Sale) => {
    // Generate sequential ID
    const nextId = sales.length > 0 ? Math.max(...sales.map(sale => sale.id)) + 1 : 1001;
    const newSale = { ...s, id: nextId };

    setSales([...sales, newSale]);
    
    // Decrease stock
    const newProducts = [...products];
    s.items.forEach(item => {
      const prodIndex = newProducts.findIndex(p => p.id === item.id);
      if (prodIndex !== -1) {
        newProducts[prodIndex].stock = Math.max(0, newProducts[prodIndex].stock - item.quantity);
      }
    });
    setProducts(newProducts);
  };

  // Clients
  const addClient = (c: Client) => setClients([...clients, c]);
  const updateClient = (id: number, c: Partial<Client>) => {
    setClients(clients.map(cli => cli.id === id ? { ...cli, ...c } : cli));
  };
  const deleteClient = (id: number) => setClients(clients.filter(c => c.id !== id));

  // Suppliers
  const addSupplier = (s: Supplier) => setSuppliers([...suppliers, s]);
  const updateSupplier = (id: string, s: Partial<Supplier>) => {
    setSuppliers(suppliers.map(sup => sup.id === id ? { ...sup, ...s } : sup));
  };
  const deleteSupplier = (id: string) => setSuppliers(suppliers.filter(s => s.id !== id));

  // Custom Orders (Pedidos)
  const addOrder = (o: Order) => setOrders([...orders, o]);
  const updateOrder = (id: number, o: Partial<Order>) => {
    setOrders(orders.map(ord => ord.id === id ? { ...ord, ...o } : ord));
  };
  const updateOrderStatus = (id: number, status: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };
  const deleteOrder = (id: number) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  // Purchase Orders (Ordenes de Compra)
  const addPurchaseOrder = (po: PurchaseOrder) => setPurchaseOrders([...purchaseOrders, po]);
  const updatePurchaseOrderStatus = (id: string, status: 'Pendiente' | 'Recibida' | 'Cancelada') => {
     setPurchaseOrders(prev => prev.map(po => {
        if (po.id !== id) return po;
        
        // If changing to "Recibida", increase stock
        if (status === 'Recibida' && po.status !== 'Recibida') {
           const newProducts = [...products];
           po.items.forEach(item => {
              const prodIndex = newProducts.findIndex(p => p.id === item.id);
              if (prodIndex !== -1) {
                 newProducts[prodIndex].stock += item.quantity;
              }
           });
           setProducts(newProducts);
        }
        return { ...po, status };
     }));
  };

  // Discounts
  const addDiscount = (d: Discount) => setDiscounts([...discounts, d]);
  const updateDiscount = (id: number, d: Partial<Discount>) => {
    setDiscounts(discounts.map(disc => disc.id === id ? { ...disc, ...d } : disc));
  };
  const toggleDiscount = (id: number) => setDiscounts(discounts.map(d => d.id === id ? { ...d, active: !d.active } : d));
  const deleteDiscount = (id: number) => setDiscounts(discounts.filter(d => d.id !== id));

  // Backup System
  const exportData = () => {
    const data = {
      usersList, products, sales, clients, suppliers, orders, purchaseOrders, discounts
    };
    return JSON.stringify(data);
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.usersList) setUsersList(data.usersList);
      if (data.products) setProducts(data.products);
      if (data.sales) setSales(data.sales);
      if (data.clients) setClients(data.clients);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.orders) setOrders(data.orders);
      if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);
      if (data.discounts) setDiscounts(data.discounts);
    } catch (e) {
      console.error("Failed to import data", e);
      throw new Error("Invalid Backup File");
    }
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      usersList, addUser, updateUser, deleteUser,
      products, addProduct, updateProduct, deleteProduct,
      sales, addSale,
      clients, addClient, updateClient, deleteClient,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      orders, addOrder, updateOrder, updateOrderStatus, deleteOrder,
      purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus,
      discounts, addDiscount, updateDiscount, toggleDiscount, deleteDiscount,
      exportData, importData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
