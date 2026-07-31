"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateQRCodeSVG, generateBarcodeSVG } from "@/lib/qrGenerator";
import { startCameraStream, stopCameraStream } from "@/lib/cameraScanner";
import { 
  ShoppingBag, 
  Package, 
  QrCode, 
  Users, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  RefreshCw, 
  Camera, 
  ShieldCheck, 
  UserCheck, 
  X,
  Printer,
  FileText,
  Bell,
  LogOut
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  brand: string;
  category: string;
  title: string;
  price: number;
  stock: number;
  badge?: string;
  qrCode: string;
  image: string;
  description: string;
}

interface StockLog {
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

interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  items: { productId: string; title: string; price: number; quantity: number }[];
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  date: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  // Current Role & User State
  const [currentRole, setCurrentRole] = useState<'MANAGER' | 'ADMIN' | 'STAFF'>('MANAGER');
  const [userName, setUserName] = useState<string>('คุณวิภาดา (Manager)');
  const [activeTab, setActiveTab] = useState<'products' | 'qr-scanner' | 'orders' | 'members'>('products');

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Print & Zoom Modals State
  const [printQRProduct, setPrintQRProduct] = useState<Product | null>(null);
  const [zoomQRProduct, setZoomQRProduct] = useState<Product | null>(null);
  const [labelQuantity, setLabelQuantity] = useState(4);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    brand: 'QUINN',
    category: 'women',
    price: '',
    stock: '',
    badge: 'NEW ARRIVAL',
    description: '',
    image: '/images/fashion_jacket.jpg'
  });

  // QR Code Scanner State
  const [qrQuery, setQrQuery] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [receiveQty, setReceiveQty] = useState('');
  const [receiveNote, setReceiveNote] = useState('');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Camera Stream State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const toggleCameraScanner = async () => {
    if (isCameraActive) {
      stopCameraStream(cameraStream);
      setCameraStream(null);
      setIsCameraActive(false);
    } else {
      setIsCameraActive(true);
      setTimeout(async () => {
        if (videoRef.current) {
          const stream = await startCameraStream(videoRef.current, (code) => {
            setQrQuery(code);
            handleScanQR(code);
          });
          setCameraStream(stream);
          if (!stream) {
            showToast('ไม่สามารถเข้าถึงกล้องวีดีโอได้ กรุณาอนุญาตให้ใช้งานกล้อง', 'error');
            setIsCameraActive(false);
          }
        }
      }, 300);
    }
  };

  // LINE Notification Status
  const [lineStatus, setLineStatus] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Auth Check from LocalStorage
    const storedRole = localStorage.getItem("tuk_role") as any;
    const storedUser = localStorage.getItem("tuk_user");
    if (storedRole) setCurrentRole(storedRole);
    if (storedUser) setUserName(storedUser);

    fetchData();

    // Auto-load product if scanned from mobile camera via URL parameter (?code=TUK-MEL-001)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get('code') || urlParams.get('scan');
      if (codeParam) {
        setActiveTab('qr-scanner');
        setQrQuery(codeParam);
        handleScanQR(codeParam);
      }
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resOrd] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ]);
      const dataProd = await resProd.json();
      const dataOrd = await resOrd.json();

      if (dataProd.success) setProducts(dataProd.products);
      if (dataOrd.success) setOrders(dataOrd.orders);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusToast({ text, type });
    setTimeout(() => setStatusToast(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem("tuk_role");
    localStorage.removeItem("tuk_user");
    router.push("/admin/login");
  };

  // Trigger LINE OA Alert Simulation
  const triggerLineAlert = (title: string, msg: string) => {
    const text = `ส่ง LINE Notification: "${title}" สำเร็จเรียบร้อย`;
    setLineStatus(text);
    showToast(text);
    setTimeout(() => setLineStatus(null), 4000);
  };

  // Save Product (Add / Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentRole !== 'MANAGER' && currentRole !== 'ADMIN') {
      showToast('สิทธิ์ไม่เพียงพอ! เฉพาะผู้จัดการ (Manager) เท่านั้นที่บันทึกข้อมูลสินค้าได้', 'error');
      return;
    }

    try {
      const isEdit = !!editingProduct;
      const url = '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit
        ? {
            id: editingProduct.id,
            title: formData.title,
            brand: formData.brand,
            category: formData.category,
            price: Number(formData.price),
            stock: Number(formData.stock),
            badge: formData.badge,
            description: formData.description,
            userRole: currentRole,
            userName
          }
        : {
            title: formData.title,
            brand: formData.brand,
            category: formData.category,
            price: Number(formData.price),
            stock: Number(formData.stock),
            badge: formData.badge,
            description: formData.description,
            image: formData.image,
            userRole: currentRole,
            userName
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message || (isEdit ? 'แก้ไขข้อมูลสินค้าสำเร็จ' : 'เพิ่มสินค้าใหม่เรียบร้อย'));
        setIsProductModalOpen(false);
        setEditingProduct(null);
        resetForm();
        fetchData();
        triggerLineAlert('อัปเดตข้อมูลสินค้าเข้าคลัง', `สินค้า ${formData.title} ถูกบันทึกข้อมูลแล้ว`);
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาดในการบันทึกสินค้า', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    }
  };

  const openAddModal = () => {
    if (currentRole !== 'MANAGER' && currentRole !== 'ADMIN') {
      showToast('สิทธิ์ไม่เพียงพอ! เฉพาะพนักงานระดับผู้จัดการ (Manager) เท่านั้นที่สามารถเพิ่มสินค้าได้', 'error');
      return;
    }
    setEditingProduct(null);
    resetForm();
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    if (currentRole !== 'MANAGER' && currentRole !== 'ADMIN') {
      showToast('สิทธิ์ไม่เพียงพอ! เฉพาะพนักงานระดับผู้จัดการ (Manager) เท่านั้นที่สามารถแก้ไขข้อมูลสินค้าได้', 'error');
      return;
    }
    setEditingProduct(p);
    setFormData({
      title: p.title,
      brand: p.brand,
      category: p.category,
      price: p.price.toString(),
      stock: p.stock.toString(),
      badge: p.badge || 'NEW ARRIVAL',
      description: p.description,
      image: p.image
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (currentRole !== 'MANAGER' && currentRole !== 'ADMIN') {
      showToast('สิทธิ์ไม่เพียงพอ! เฉพาะพนักงานระดับผู้จัดการเท่านั้นที่ลบสินค้าได้', 'error');
      return;
    }
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้ารายการนี้?')) return;

    try {
      const res = await fetch(`/api/products?id=${id}&role=${currentRole}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('ลบสินค้ารายการนี้เรียบร้อยแล้ว');
        fetchData();
      } else {
        showToast(data.error || 'ลบไม่สำเร็จ', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการลบ', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      brand: 'QUINN',
      category: 'women',
      price: '',
      stock: '',
      badge: 'NEW ARRIVAL',
      description: '',
      image: '/images/fashion_jacket.jpg'
    });
  };

  // QR Code Scanning
  const handleScanQR = async (codeToScan?: string) => {
    const code = codeToScan || qrQuery;
    if (!code) {
      setScanMessage({ type: 'error', text: 'กรุณาระบุรหัส QR Code หรือ SKU' });
      return;
    }

    try {
      const res = await fetch(`/api/scan-qr?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (data.success) {
        setScannedProduct(data.product);
        setStockLogs(data.logs);
        setScanMessage({ type: 'success', text: data.message });
      } else {
        setScannedProduct(null);
        setStockLogs([]);
        setScanMessage({ type: 'error', text: data.error || 'ไม่พบสินค้า' });
      }
    } catch (err) {
      setScanMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการสแกน QR Code' });
    }
  };

  // Receive Stock via QR
  const handleReceiveStock = async () => {
    if (!scannedProduct) return;
    if (currentRole !== 'MANAGER' && currentRole !== 'ADMIN') {
      setScanMessage({ type: 'error', text: 'สิทธิ์ไม่เพียงพอ! เฉพาะพนักงานระดับผู้จัดการ (Manager) เท่านั้นที่บันทึกรับสินค้าเข้าสต็อกได้' });
      return;
    }

    const qty = Number(receiveQty);
    if (!qty || qty <= 0) {
      setScanMessage({ type: 'error', text: 'กรุณาระบุจำนวนสินค้าที่รับเข้าให้ถูกต้อง (>0)' });
      return;
    }

    try {
      const res = await fetch('/api/scan-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: scannedProduct.qrCode,
          addQuantity: qty,
          userRole: currentRole,
          userName,
          note: receiveNote || 'สแกน QR Code บันทึกรับสินค้าเข้าสต็อก'
        })
      });

      const data = await res.json();
      if (data.success) {
        setScanMessage({ type: 'success', text: data.message });
        setReceiveQty('');
        setReceiveNote('');
        handleScanQR(scannedProduct.qrCode);
        fetchData();
        triggerLineAlert('บันทึกรับสินค้าเข้าคลัง', `${scannedProduct.title} เติมสต็อก +${qty} ชิ้น`);
      } else {
        setScanMessage({ type: 'error', text: data.error || 'บันทึกรับเข้าไม่สำเร็จ' });
      }
    } catch (err) {
      setScanMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกรับสินค้า' });
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status === 'PAID' || o.status === 'SHIPPED' ? o.totalAmount : 0), 0);
  const lowStockCount = products.filter(p => p.stock <= 15).length;

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-prompt pb-20">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {statusToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 shadow-xl font-kanit text-xs text-white font-semibold flex items-center gap-2 border ${
              statusToast.type === 'success' ? 'bg-black border-neutral-700' : 'bg-red-600 border-red-700'
            }`}
          >
            {statusToast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-white" />}
            <span>{statusToast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Header */}
      <header className="bg-black text-white py-4 px-4 sm:px-8 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-black text-2xl tracking-tighter uppercase">
              TUK<span className="font-light tracking-widest text-neutral-400">SHOP</span>
            </Link>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-neutral-800 text-white px-2 py-0.5 border border-neutral-700">
              BACK-OFFICE v2.5
            </span>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 p-1 border border-neutral-800 rounded-xs">
              <span className="text-[10px] font-mono text-neutral-400 px-2 uppercase font-bold">ผู้ใช้: {userName}</span>
              {[
                { role: 'MANAGER', label: '👔 ผู้จัดการ (Manager)' },
                { role: 'ADMIN', label: '👑 Admin' },
                { role: 'STAFF', label: '💼 Staff' },
              ].map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    setCurrentRole(r.role as any);
                    localStorage.setItem('tuk_role', r.role);
                    showToast(`สลับโหมดใช้งานเป็น: ${r.label}`);
                  }}
                  className={`px-3 py-1 text-xs font-bold transition-all ${
                    currentRole === r.role
                      ? 'bg-white text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="bg-neutral-800 text-white p-2 hover:bg-red-600 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* Realtime Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 border border-neutral-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">ยอดขายรวม</span>
            <span className="text-2xl font-black text-black">฿{totalRevenue.toLocaleString()}</span>
            <button 
              onClick={() => triggerLineAlert('รายงานยอดขายประจำวัน', `ยอดขายรวมวันนี้ ฿${totalRevenue.toLocaleString()}`)}
              className="text-[10px] text-black underline block mt-1 font-semibold"
            >
              📲 ส่งรายงานเข้า LINE OA
            </button>
          </div>

          <div className="bg-white p-5 border border-neutral-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">คำสั่งซื้อทั้งหมด</span>
            <span className="text-2xl font-black text-black">{orders.length} ออเดอร์</span>
            <span className="text-[10px] text-neutral-500 block mt-1">ออเดอร์ใหม่วันนี้</span>
          </div>

          <div className="bg-white p-5 border border-neutral-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">รายการสินค้า</span>
            <span className="text-2xl font-black text-black">{products.length} สินค้า</span>
            <span className="text-[10px] text-neutral-500 block mt-1">พร้อมรหัส QR Code</span>
          </div>

          <div className="bg-white p-5 border border-neutral-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">แจ้งเตือนสต็อกต่ำ</span>
            <span className={`text-2xl font-black ${lowStockCount > 0 ? 'text-red-600' : 'text-black'}`}>{lowStockCount} รายการ</span>
            <button 
              onClick={() => triggerLineAlert('เตือนสต็อกสินค้าต่ำ', `มีสินค้าสต็อกต่ำกว่า 15 ชิ้น จำนวน ${lowStockCount} รายการ`)}
              className="text-[10px] text-red-600 font-bold block mt-1 underline"
            >
              🔔 แจ้งเตือนเข้า LINE OA
            </button>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex border-b border-neutral-300 mb-8 bg-white p-1">
          {[
            { id: 'products', label: '📦 จัดการสินค้า (Products)', badge: currentRole === 'MANAGER' ? 'Manager Enabled' : '' },
            { id: 'qr-scanner', label: '📷 ติดตามสินค้าด้วย QR Code', badge: 'NEW' },
            { id: 'orders', label: '🛍️ รายการคำสั่งซื้อ (Orders)', badge: `${orders.length}` },
            { id: 'members', label: '👥 สมาชิก JPS Club', badge: '2' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 font-mono ${activeTab === tab.id ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 border border-neutral-200">
              <div>
                <h2 className="font-black text-lg text-black uppercase">รายการสินค้าในคลัง (Products)</h2>
                <p className="font-kanit text-xs text-neutral-500 font-light">
                  {currentRole === 'MANAGER' || currentRole === 'ADMIN' 
                    ? 'สิทธิ์ผู้จัดการ (Manager): สามารถเพิ่มสินค้าใหม่, แก้ไขราคา, ปรับสต็อก, พิมพ์ป้าย QR และลบสินค้าได้'
                    : 'โหมดอ่านอย่างเดียว (Staff): ดูข้อมูลสินค้าและสต็อก'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* BUTTON LABELED JUST 'admin' */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("https://tukshop.ratchavit.com/login");
                    showToast("คัดลอกลิงก์สมัครสมาชิก (https://tukshop.ratchavit.com/login) เรียบร้อยแล้ว!", "success");
                  }}
                  className="bg-black text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 hover:bg-neutral-800 transition-colors border border-neutral-700 font-mono shadow-xs"
                  title="ส่งลิงก์หน้าสมัครสมาชิก"
                >
                  admin
                </button>

                {(currentRole === 'MANAGER' || currentRole === 'ADMIN') && (
                  <button
                    onClick={openAddModal}
                    className="bg-black text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-neutral-800 transition-colors flex items-center gap-2 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ เพิ่มสินค้าใหม่ (Manager)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white border border-neutral-200 p-5 flex flex-col justify-between hover:border-black transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 gap-3">
                      <div>
                        <span className="text-[9px] font-mono font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 border border-neutral-200 uppercase block w-max mb-1">
                          {p.brand}
                        </span>
                        <span className="text-[10px] font-mono bg-black text-white font-bold px-1.5 py-0.5 block w-max mb-1">
                          {p.qrCode}
                        </span>
                        <button
                          onClick={() => setZoomQRProduct(p)}
                          className="text-[9px] text-blue-600 font-bold underline block hover:text-black font-mono"
                        >
                          🔍 ขยายสแกนใหญ่
                        </button>
                      </div>

                      {/* Prominent High-Contrast Visual QR Code */}
                      <div 
                        onClick={() => setZoomQRProduct(p)}
                        className="w-24 h-24 bg-white border-2 border-black p-1 shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(`https://tukshop.ratchavit.com/admin?code=${p.qrCode}`, 90) }}
                        title="คลิกเพื่อขยายรูป QR Code สำหรับสแกนด้วยมือถือ"
                      />
                    </div>

                    <h3 className="font-bold text-sm text-black mb-2 leading-snug">{p.title}</h3>
                    <p className="font-kanit text-xs text-neutral-500 font-light mb-4 line-clamp-2">{p.description}</p>
                  </div>

                  <div>
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-black block font-prompt">฿{p.price.toLocaleString()}</span>
                        <span className={`text-[10px] font-mono font-bold ${p.stock <= 15 ? 'text-red-600 font-bold' : 'text-neutral-500'}`}>
                          สต็อกคงเหลือ: {p.stock} ชิ้น
                        </span>
                      </div>

                      {(currentRole === 'MANAGER' || currentRole === 'ADMIN') ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-black hover:bg-neutral-100 border border-neutral-300"
                            title="แก้ไขข้อมูลสินค้า (Manager)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200"
                            title="ลบสินค้า"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-mono">STAFF VIEW</span>
                      )}
                    </div>

                    {/* Print QR Sticker Label Button */}
                    <button
                      onClick={() => setPrintQRProduct(p)}
                      className="w-full bg-neutral-100 border border-neutral-300 text-black text-xs font-bold uppercase tracking-wider py-2 hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>🖨️ พิมพ์ป้ายสติ๊กเกอร์ QR Code / Barcode</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: QR CODE SCANNER & PRODUCT TRACKING */}
        {activeTab === 'qr-scanner' && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-neutral-200">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                INSTANT SCANNER & STOCK TRACKING
              </span>
              <h2 className="font-black text-xl text-black uppercase mb-4">
                ระบบสแกน QR Code และติดตามประวัติสินค้า
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mb-4">
                <input
                  type="text"
                  value={qrQuery}
                  onChange={(e) => setQrQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleScanQR();
                    }
                  }}
                  autoFocus
                  placeholder="สแกนรหัสบาร์โค้ด หรือพิมพ์ QR Code (เช่น TUK-SAT-002)..."
                  className="bg-neutral-50 border border-neutral-300 text-xs text-black px-4 py-3 font-mono focus:outline-none focus:border-black flex-1"
                />
                <button
                  onClick={() => handleScanQR()}
                  className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>ค้นหาข้อมูล</span>
                </button>
                <button
                  onClick={toggleCameraScanner}
                  className={`text-xs font-bold uppercase tracking-widest px-4 py-3 border transition-colors flex items-center justify-center gap-2 shrink-0 ${
                    isCameraActive ? 'bg-red-600 text-white border-red-600' : 'bg-neutral-100 text-black border-neutral-300 hover:bg-black hover:text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCameraActive ? 'ปิดกล้อง' : '📹 เปิดกล้องสแกน'}</span>
                </button>
              </div>

              {/* Live Camera Feed Container */}
              {isCameraActive && (
                <div className="mb-4 max-w-md mx-auto bg-black p-2 border-2 border-dashed border-red-500 relative">
                  <span className="text-[9px] font-mono font-bold text-white bg-red-600 px-2 py-0.5 uppercase block w-max mb-1">
                    🔴 LIVE CAMERA SCANNER (เล็งกล้องไปที่ QR CODE)
                  </span>
                  <video ref={videoRef} className="w-full h-48 object-cover bg-neutral-900 border border-neutral-700" />
                </div>
              )}

              {/* Sample Quick QR Buttons */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-neutral-500">
                <span>คลิกทดลองสแกนรหัสตัวอย่าง:</span>
                {products.slice(0, 4).map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setQrQuery(p.qrCode);
                      handleScanQR(p.qrCode);
                    }}
                    className="bg-neutral-100 border border-neutral-300 px-2 py-1 hover:bg-black hover:text-white transition-colors"
                  >
                    {p.qrCode}
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Result Feedback Toast */}
            {scanMessage && (
              <div className={`p-4 border font-kanit text-xs flex items-center justify-between ${
                scanMessage.type === 'success' ? 'bg-neutral-900 text-white border-black' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                <span>{scanMessage.text}</span>
                <button onClick={() => setScanMessage(null)}><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Scanned Product Info & Track History */}
            {scannedProduct && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Product Data Card */}
                <div className="bg-white p-6 border border-neutral-200 font-kanit">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase block w-max mb-1">
                        QR: {scannedProduct.qrCode}
                      </span>
                      <span className="text-xs font-bold text-neutral-500">{scannedProduct.brand}</span>
                    </div>

                    {/* Scanned QR Code SVG Display */}
                    <div 
                      className="w-16 h-16 bg-white border border-neutral-300 p-1 shadow-xs"
                      dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(scannedProduct.qrCode, 58) }}
                    />
                  </div>

                  <h3 className="font-prompt font-bold text-lg text-black mb-2">{scannedProduct.title}</h3>
                  <p className="text-xs text-neutral-500 font-light mb-4">{scannedProduct.description}</p>

                  <div className="space-y-2 border-t border-b border-neutral-100 py-3 text-xs">
                    <div className="flex justify-between"><span className="text-neutral-500">แบรนด์:</span><span className="font-bold text-black">{scannedProduct.brand}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">หมวดหมู่:</span><span className="font-bold text-black uppercase">{scannedProduct.category}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">ราคาขาย:</span><span className="font-bold text-black font-prompt">฿{scannedProduct.price.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">จำนวนคงเหลือในคลัง:</span><span className="font-bold text-black font-mono text-sm">{scannedProduct.stock} ชิ้น</span></div>
                  </div>

                  <button
                    onClick={() => setPrintQRProduct(scannedProduct)}
                    className="w-full mt-3 bg-neutral-100 border border-neutral-300 text-black text-xs font-bold uppercase tracking-wider py-2.5 hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1.5 font-prompt"
                  >
                    <Printer className="w-4 h-4" />
                    <span>🖨️ พิมพ์ป้ายสติ๊กเกอร์ QR Code</span>
                  </button>

                  {/* Stock Receiving Form (Manager Role) */}
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <h4 className="font-prompt font-bold text-xs uppercase text-black mb-3">บันทึกรับสินค้าเข้าสต็อกด้วย QR (Manager)</h4>
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={receiveQty}
                        onChange={(e) => setReceiveQty(e.target.value)}
                        placeholder="จำนวนที่รับเข้า (ชิ้น)..."
                        className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-kanit"
                      />
                      <input
                        type="text"
                        value={receiveNote}
                        onChange={(e) => setReceiveNote(e.target.value)}
                        placeholder="หมายเหตุ (เช่น รับสินค้าจากโรงงาน)..."
                        className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-kanit"
                      />
                      <button
                        onClick={handleReceiveStock}
                        className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-2.5 hover:bg-neutral-800 transition-colors"
                      >
                        + บันทึกเพิ่มสต็อก (Manager)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock Movement Log History */}
                <div className="lg:col-span-2 bg-white p-6 border border-neutral-200 font-kanit">
                  <h3 className="font-prompt font-bold text-base uppercase text-black mb-4">
                    ประวัติการเคลื่อนไหวสต็อก (Stock Movement History)
                  </h3>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {stockLogs.map(log => (
                      <div key={log.id} className="p-3 border border-neutral-200 flex items-center justify-between text-xs bg-neutral-50">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold font-mono px-2 py-0.5 uppercase ${
                              log.type === 'IN' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {log.type === 'IN' ? `รับเข้า (+${log.quantity})` : `ขายออก (-${log.quantity})`}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">{log.date}</span>
                          </div>
                          <p className="font-semibold text-black">{log.note}</p>
                          <span className="text-[10px] text-neutral-500">โดย: {log.performedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT & RECEIPT PRINTER */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 border border-neutral-200 font-kanit">
            <h2 className="font-prompt font-black text-xl text-black uppercase mb-6">
              รายการคำสั่งซื้อจากหน้าร้าน (Orders)
            </h2>

            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="p-4 border border-neutral-200 flex flex-col sm:flex-row justify-between gap-4 bg-neutral-50">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-sm text-black">#{order.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 font-mono uppercase ${
                        order.status === 'PAID' ? 'bg-black text-white' : 'bg-green-600 text-white'
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">{order.date}</span>
                    </div>

                    <p className="font-bold text-xs text-black">{order.customerName} ({order.phone})</p>
                    <ul className="text-xs text-neutral-600 space-y-1 mt-2">
                      {order.items.map((item, idx) => (
                        <li key={idx}>• {item.title} (x{item.quantity}) - ฿{item.price.toLocaleString()}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-3">
                    <span className="font-prompt font-black text-lg text-black">฿{order.totalAmount.toLocaleString()}</span>
                    
                    <div className="flex flex-wrap gap-2">
                      {/* Print 80mm POS Thermal Receipt Button */}
                      <button
                        onClick={() => setPrintOrder(order)}
                        className="bg-white border border-neutral-300 text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>🧾 พิมพ์ใบเสร็จ 80mm</span>
                      </button>

                      <button
                        onClick={async () => {
                          const newStatus = order.status === 'PAID' ? 'SHIPPED' : 'PAID';
                          await fetch('/api/orders', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderId: order.id, status: newStatus })
                          });
                          fetchData();
                          showToast(`อัปเดตสถานะออเดอร์ #${order.id} เป็น ${newStatus}`);
                        }}
                        className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 hover:bg-neutral-800 transition-colors"
                      >
                        สลับสถานะ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MEMBERS MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="bg-white p-6 border border-neutral-200 font-kanit">
            <h2 className="font-prompt font-black text-xl text-black uppercase mb-6">
              สมาชิก JPS CLUB & ลิสต์ลูกค้า
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-black">คุณอนันต์ ชัยเจริญ</h4>
                  <p className="text-xs text-neutral-500">อีเมล: anan@gmail.com | โทร: 081-234-5678</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-neutral-400 block">JPS POINTS</span>
                  <span className="font-prompt font-bold text-base text-black">350 คะแนน</span>
                </div>
              </div>

              <div className="p-4 border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-black">คุณกัลยา สมบูรณ์</h4>
                  <p className="text-xs text-neutral-500">อีเมล: kanlaya@hotmail.com | โทร: 089-876-5432</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-neutral-400 block">JPS POINTS</span>
                  <span className="font-prompt font-bold text-base text-black">490 คะแนน</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* HD BIG QR CODE ZOOM MODAL FOR CAMERA SCANNING */}
      <AnimatePresence>
        {zoomQRProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomQRProduct(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer font-prompt"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-black max-w-sm w-full p-6 shadow-2xl cursor-default relative text-center"
            >
              <button
                onClick={() => setZoomQRProduct(null)}
                className="absolute top-4 right-4 p-2 text-black hover:opacity-60"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase">
                  HD CAMERA SCANNABLE QR CODE
                </span>
              </div>
              
              <h3 className="font-black text-base text-black uppercase mb-1">
                {zoomQRProduct.title}
              </h3>
              <span className="text-xs font-mono font-bold text-neutral-500 block mb-4">
                รหัสสินค้า: {zoomQRProduct.qrCode} | แบรนด์: {zoomQRProduct.brand}
              </span>

              {/* HUGE HIGH-CONTRAST 260px QR CODE DISPLAY */}
              <div className="bg-white p-3 border-2 border-black max-w-[260px] mx-auto shadow-md mb-4 flex items-center justify-center">
                <div 
                  className="w-[240px] h-[240px] flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(`https://tukshop.ratchavit.com/admin?code=${zoomQRProduct.qrCode}`, 235) }}
                />
              </div>

              <div className="p-3 bg-neutral-100 border border-neutral-300 font-kanit text-xs text-black font-semibold mb-4">
                📲 ยกกล้องมือถือสแกนรูปนี้เพื่อดึงข้อมูลสินค้าและเช็คสต็อกได้ทันที!
              </div>

              <button
                onClick={() => setZoomQRProduct(null)}
                className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-neutral-800 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. PRINT QR CODE / BARCODE STICKER LABEL MODAL */}
      <AnimatePresence>
        {printQRProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPrintQRProduct(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer font-prompt"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-neutral-300 max-w-lg w-full p-6 shadow-2xl cursor-default relative"
            >
              <button
                onClick={() => setPrintQRProduct(null)}
                className="absolute top-4 right-4 p-2 text-black hover:opacity-60"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase">
                  LABEL STICKER PRINTER
                </span>
              </div>
              <h3 className="font-black text-lg text-black uppercase mb-4">
                ตัวอย่างป้ายสติ๊กเกอร์ QR Code / Barcode (50x30mm)
              </h3>

              {/* Printable Label Preview */}
              <div className="printable-area border-2 border-dashed border-neutral-400 p-4 bg-neutral-50 mb-4 flex flex-col items-center justify-center text-center">
                <div className="qr-label-sticker w-[52mm] h-[34mm] bg-white border border-black p-2 flex flex-col justify-between items-center text-center shadow-xs">
                  <span className="font-black text-[10px] tracking-tighter uppercase font-prompt">
                    TUK<span className="font-light tracking-widest">SHOP</span> ({printQRProduct.brand})
                  </span>
                  
                  <div className="flex items-center gap-2 justify-center my-1">
                    <div 
                      className="w-14 h-14 shrink-0 border border-neutral-200"
                      dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(`https://tukshop.ratchavit.com/admin?code=${printQRProduct.qrCode}`, 55) }}
                    />
                    <div className="text-left font-mono text-[8px] space-y-0.5">
                      <div className="font-bold text-black text-[9px]">{printQRProduct.qrCode}</div>
                      <div className="text-neutral-500">CAT: {printQRProduct.category.toUpperCase()}</div>
                      <div className="text-neutral-500">STOCK: {printQRProduct.stock}</div>
                    </div>
                  </div>

                  <div className="w-full border-t border-neutral-200 pt-1">
                    <span className="font-bold text-[9px] text-black font-kanit block line-clamp-1">
                      {printQRProduct.title}
                    </span>
                    <span className="font-black text-[11px] text-black font-prompt">
                      ฿{printQRProduct.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Label Quantity selector */}
              <div className="flex items-center justify-between mb-6 font-kanit text-xs bg-neutral-100 p-3">
                <span className="font-semibold text-black">จำนวนแผ่นสติ๊กเกอร์ที่ต้องการพิมพ์:</span>
                <select
                  value={labelQuantity}
                  onChange={(e) => setLabelQuantity(Number(e.target.value))}
                  className="bg-white border border-neutral-300 font-bold px-3 py-1 font-mono text-xs focus:outline-none"
                >
                  {[1, 2, 4, 10, 20, 50, 100].map(n => (
                    <option key={n} value={n}>{n} แผ่น</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPrintQRProduct(null)}
                  className="w-1/2 py-2.5 border border-neutral-300 text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-100"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    window.print();
                    showToast(`สั่งพิมพ์ป้ายสติ๊กเกอร์ ${printQRProduct.qrCode} จำนวน ${labelQuantity} แผ่นสำเร็จ`);
                  }}
                  className="w-1/2 bg-black text-white text-xs font-bold uppercase tracking-widest py-2.5 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ สั่งพิมพ์ป้ายสติ๊กเกอร์</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PRINT 80MM POS THERMAL RECEIPT SLIP MODAL */}
      <AnimatePresence>
        {printOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPrintOrder(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer font-prompt"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-neutral-300 max-w-md w-full p-6 shadow-2xl cursor-default relative"
            >
              <button
                onClick={() => setPrintOrder(null)}
                className="absolute top-4 right-4 p-2 text-black hover:opacity-60"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase">
                  POS THERMAL SLIP 80MM
                </span>
              </div>
              <h3 className="font-black text-lg text-black uppercase mb-4">
                ตัวอย่างใบเสร็จรับเงิน (80mm Receipt Slip)
              </h3>

              {/* Printable 80mm Thermal Receipt Layout */}
              <div className="printable-area border border-neutral-300 p-4 bg-neutral-50 mb-4 max-h-[380px] overflow-y-auto">
                <div className="thermal-receipt-80mm bg-white border border-neutral-200 p-4 font-mono text-[11px] text-black space-y-2">
                  <div className="text-center font-bold pb-2 border-b border-black">
                    <span className="text-sm uppercase block font-prompt font-black">TUKSHOP DIGITAL BOUTIQUE</span>
                    <span className="text-[9px] block">สาขาใหญ่ สยามพารากอน กรุงเทพฯ</span>
                    <span className="text-[9px] block">เลขประจำตัวผู้เสียภาษี: 0105569000123</span>
                  </div>

                  <div className="text-[10px] space-y-0.5 border-b border-black pb-2">
                    <div>เลขที่ใบเสร็จ: #{printOrder.id}</div>
                    <div>วันที่: {printOrder.date}</div>
                    <div>ลูกค้า: {printOrder.customerName}</div>
                    <div>สถานะการชำระ: {printOrder.status}</div>
                  </div>

                  <table className="w-full text-left text-[10px] border-b border-black pb-2">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="py-1">รายการ</th>
                        <th className="py-1 text-center">จำนวน</th>
                        <th className="py-1 text-right">รวม (บาท)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1 line-clamp-1">{item.title}</td>
                          <td className="py-1 text-center">x{item.quantity}</td>
                          <td className="py-1 text-right">{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="space-y-1 text-right font-bold text-[11px] pt-1">
                    <div>รวมเป็นเงิน: ฿{printOrder.totalAmount.toLocaleString()}</div>
                    <div>ภาษีมูลค่าเพิ่ม VAT 7%: ฿{(printOrder.totalAmount * 0.07).toFixed(2)}</div>
                    <div className="text-sm pt-1 border-t border-black">ยอดชำระสุทธิ: ฿{printOrder.totalAmount.toLocaleString()}</div>
                  </div>

                  <div className="text-center text-[9px] pt-3 border-t border-black">
                    <div>ขอบคุณที่ใช้บริการ TUKSHOP</div>
                    <div>คะแนนสะสม JPS Club ล่าสุด: 350 แต้ม</div>
                    <div>*** สินค้าสามารถเปลี่ยนไซส์ได้ภายใน 7 วัน ***</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPrintOrder(null)}
                  className="w-1/2 py-2.5 border border-neutral-300 text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 font-prompt"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    window.print();
                    showToast(`พิมพ์ใบเสร็จรับเงิน 80mm สำหรับคำสั่งซื้อ #${printOrder.id} เรียบร้อยแล้ว`);
                  }}
                  className="w-1/2 bg-black text-white text-xs font-bold uppercase tracking-widest py-2.5 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 font-prompt"
                >
                  <Printer className="w-4 h-4" />
                  <span>🧾 สั่งพิมพ์ใบเสร็จ (80mm)</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manager Product Form Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsProductModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer font-prompt"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-neutral-300 max-w-xl w-full p-6 shadow-2xl cursor-default relative"
            >
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-black hover:opacity-60"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-[9px] font-mono font-bold bg-black text-white px-2.5 py-0.5 uppercase">
                  MANAGER PERMISSION AUTHORIZED
                </span>
              </div>

              <h3 className="font-black text-xl uppercase text-black mb-4">
                {editingProduct ? 'แก้ไขข้อมูลสินค้า (Manager Edit)' : 'เพิ่มสินค้าใหม่เข้าคลัง (Manager Add)'}
              </h3>

              <form onSubmit={handleSaveProduct} className="space-y-4 font-kanit text-xs">
                <div>
                  <label className="font-bold text-black block mb-1">ชื่อสินค้า (Product Title)*</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="เช่น แจ็คเก็ตฮู้ดดี้แต่งซิปคู่..."
                    className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-black block mb-1">แบรนด์ (Brand)</label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-prompt uppercase"
                    >
                      {["QUINN", "SATUR", "MELISSA", "MARITHÉ", "REEF", "IPANEMA", "DIESEL", "PUMA"].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-black block mb-1">หมวดหมู่ (Category)</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-prompt uppercase"
                    >
                      <option value="women">ผู้หญิง (Women)</option>
                      <option value="men">ผู้ชาย (Men)</option>
                      <option value="accessories">เครื่องประดับ (Accessories)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-black block mb-1">ราคาขาย (บาท)*</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="เช่น 2290"
                      className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-prompt"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-black block mb-1">จำนวนสต็อกแรกเข้า*</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      placeholder="เช่น 25"
                      className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-prompt"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-black block mb-1">ป้ายสินค้า (Badge Tag)</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="เช่น NEW ARRIVAL / HOT / LIMITED"
                    className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-prompt uppercase"
                  />
                </div>

                <div>
                  <label className="font-bold text-black block mb-1">คำอธิบายรายละเอียดสินค้า</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="รายละเอียดเพิ่มเติมของสินค้า..."
                    className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-2.5 border border-neutral-300 text-black font-bold uppercase tracking-wider hover:bg-neutral-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-neutral-800 transition-colors"
                  >
                    บันทึกข้อมูล (Manager Save)
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
