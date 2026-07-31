import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  email: string;
}

export interface Product {
  id: string;
  brand: string;
  category: string;
  title: string;
  price: number;
  originalPrice?: number;
  stock: number;
  badge?: string;
  qrCode: string;
  image: string;
  description: string;
}

export interface StockLog {
  id: string;
  productId: string;
  productTitle: string;
  qrCode: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  performedBy: string;
  date: string;
  note: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  date: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  jpsPoints: number;
  joinedDate: string;
}

export interface DBData {
  users: User[];
  products: Product[];
  stockLogs: StockLog[];
  orders: Order[];
  members: Member[];
}

// Read database from disk
export function getDB(): DBData {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial: DBData = {
        users: [],
        products: [],
        stockLogs: [],
        orders: [],
        members: []
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading DB:', error);
    return { users: [], products: [], stockLogs: [], orders: [], members: [] };
  }
}

// Save database to disk
export function saveDB(data: DBData): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}

// Products Helper Methods
export function getProducts(): Product[] {
  return getDB().products;
}

export function addProduct(product: Omit<Product, 'id'>, performedBy: string): Product {
  const db = getDB();
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`
  };
  db.products.unshift(newProduct);

  // Record Stock In Log
  const stockLog: StockLog = {
    id: `log-${Date.now()}`,
    productId: newProduct.id,
    productTitle: newProduct.title,
    qrCode: newProduct.qrCode,
    type: 'IN',
    quantity: newProduct.stock,
    performedBy,
    date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    note: 'สร้างสินค้าใหม่และบันทึกสต็อกแรกเข้า'
  };
  db.stockLogs.unshift(stockLog);

  saveDB(db);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>, performedBy: string): Product | null {
  const db = getDB();
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) return null;

  const oldStock = db.products[index].stock;
  db.products[index] = { ...db.products[index], ...updates };
  const updatedProduct = db.products[index];

  // Log stock changes if stock updated
  if (updates.stock !== undefined && updates.stock !== oldStock) {
    const diff = updates.stock - oldStock;
    const stockLog: StockLog = {
      id: `log-${Date.now()}`,
      productId: updatedProduct.id,
      productTitle: updatedProduct.title,
      qrCode: updatedProduct.qrCode,
      type: diff > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(diff),
      performedBy,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      note: diff > 0 ? `ผู้จัดการเติมสต็อก (+${diff})` : `ผู้จัดการลดสต็อก (${diff})`
    };
    db.stockLogs.unshift(stockLog);
  }

  saveDB(db);
  return updatedProduct;
}

export function deleteProduct(id: string): boolean {
  const db = getDB();
  const initialLen = db.products.length;
  db.products = db.products.filter(p => p.id !== id);
  if (db.products.length !== initialLen) {
    saveDB(db);
    return true;
  }
  return false;
}

// QR Code Scanning & Tracking Methods
export function scanQRCode(qrCode: string): { product: Product | null; logs: StockLog[] } {
  const db = getDB();
  const product = db.products.find(p => p.qrCode.toUpperCase() === qrCode.toUpperCase() || p.id === qrCode) || null;
  const logs = db.stockLogs.filter(l => l.qrCode.toUpperCase() === qrCode.toUpperCase() || l.productId === qrCode);
  return { product, logs };
}

export function receiveStockByQR(qrCode: string, addQuantity: number, performedBy: string, note: string): { product: Product | null; log: StockLog | null } {
  const db = getDB();
  const product = db.products.find(p => p.qrCode.toUpperCase() === qrCode.toUpperCase() || p.id === qrCode);
  if (!product) return { product: null, log: null };

  product.stock += addQuantity;

  const log: StockLog = {
    id: `log-${Date.now()}`,
    productId: product.id,
    productTitle: product.title,
    qrCode: product.qrCode,
    type: 'IN',
    quantity: addQuantity,
    performedBy,
    date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    note: note || `สแกน QR Code รับสินค้าเข้าสต็อก (+${addQuantity})`
  };

  db.stockLogs.unshift(log);
  saveDB(db);

  return { product, log };
}

// Orders Helper Methods
export function getOrders(): Order[] {
  return getDB().orders;
}

export function addOrder(orderData: Omit<Order, 'id' | 'date'>): Order {
  const db = getDB();
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  db.orders.unshift(newOrder);

  // Deduct stock for items in order
  newOrder.items.forEach(item => {
    const prod = db.products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      db.stockLogs.unshift({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        productId: prod.id,
        productTitle: prod.title,
        qrCode: prod.qrCode,
        type: 'OUT',
        quantity: item.quantity,
        performedBy: 'ระบบสั่งซื้อหน้าร้าน',
        date: newOrder.date,
        note: `ตัดสต็อกตามคำสั่งซื้อ #${newOrder.id}`
      });
    }
  });

  saveDB(db);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order | null {
  const db = getDB();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return null;
  order.status = status;
  saveDB(db);
  return order;
}
