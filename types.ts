
export type Role = 'owner' | 'employee';

export interface User {
  id: number;
  username: string;
  role: Role;
  password?: string;
  attempts?: number;
  blocked?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  supplier: string;
  supplierPrice: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface Sale {
  id: number;
  date: string;
  total: number;
  subtotal: number;
  client: string;
  items: CartItem[];
  paymentMethod: string;
  type: 'A' | 'B' | 'X';
  discountApplied?: { name: string; amount: number };
  surcharge?: number;
}

export interface Supplier {
  id: string;
  name: string;
  rubro: string;
  phone: string;
  email: string;
  address: string;
}

export interface PurchaseOrder {
  id: string;
  date: string;
  supplierId: string;
  status: 'Pendiente' | 'Recibida' | 'Cancelada';
  items: CartItem[];
  total: number;
}

export interface Payment {
    date: string;
    amount: number;
    method: string;
}

export interface Order {
  id: number;
  date: string;
  client: string;
  email: string;
  status: 'Encargado' | 'En Producción' | 'Listo para Entrega' | 'Cancelado' | string;
  total: number;
  services: Record<string, number>;
  items: CartItem[];
  observations?: string;
  payments: Payment[];
}

export interface Discount {
  id: number;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export const CATEGORIES = ["General", "Electrónica", "Muebles", "Servicios", "Materia Prima"];
export const SERVICES_LIST = {
    "Carpintería": 5000.0,
    "Pinturería": 3000.0,
    "Embalaje": 1500.0,
    "Tapicería": 4000.0,
    "Herrería": 3500.0,
    "Instalación": 2500.0,
};
export const PAYMENT_METHODS = ["Efectivo", "QR", "Transferencia", "Débito", "Crédito"];
export const EMAIL_DOMAINS = ["@gmail.com", "@outlook.com", "@hotmail.com", "@yahoo.com", "@icloud.com"];

// --- SMTP CONFIGURATION ---
export const SMTP_CONFIG = {
    HOST: "smtp.gmail.com",
    PORT: 587,
    USER: "sistemalunel@gmail.com",
    PASS: "xayg gemg bvan uzkw",
    OWNER_EMAIL: "murualuciano01@gmail.com"
};

// --- Helper Functions ---

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(value);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const sendEmailSimulation = (to: string, subject: string, body: string, attachmentName?: string) => {
    // In a real browser app, we cannot send emails via SMTP directly due to security.
    // This function simulates the backend call.
    console.group("📧 SLING MAIL SYSTEM (Simulación)");
    console.log(`Conectando a: ${SMTP_CONFIG.HOST}:${SMTP_CONFIG.PORT}`);
    console.log(`Autenticación: ${SMTP_CONFIG.USER}`);
    console.log(`Enviando a: ${to}`);
    console.log(`Asunto: ${subject}`);
    console.log(`Cuerpo: ${body}`);
    if (attachmentName) console.log(`Adjunto: ${attachmentName}`);
    console.groupEnd();

    alert(`📧 EMAIL ENVIADO\n\nDe: ${SMTP_CONFIG.USER}\nPara: ${to}\nAsunto: ${subject}\n\n(Simulación exitosa usando credenciales configuradas)`);
};
