"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Heart, ShoppingBag, Eye, ArrowRight, X, Check, QrCode, CreditCard, ShieldCheck } from "lucide-react";

interface Product {
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

export default function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Real Checkout & PromptPay QR Modal State
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  const [isPromptPayOpen, setIsPromptPayOpen] = useState(false);
  const [orderToast, setOrderToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products API:', err);
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenCheckout = (product: Product) => {
    setCheckoutProduct(product);
    setSelectedProduct(null);
  };

  const handleConfirmPromptPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct) return;

    if (!customerInfo.name || !customerInfo.phone) {
      alert("กรุณากรอกชื่อ-นามสกุล และเบอร์โทรศัพท์สำหรับจัดส่ง");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          email: customerInfo.email || `${customerInfo.phone}@tukshop.com`,
          phone: customerInfo.phone,
          items: [{ productId: checkoutProduct.id, title: checkoutProduct.title, price: checkoutProduct.price, quantity: 1 }],
          totalAmount: checkoutProduct.price
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsPromptPayOpen(true);
        setOrderToast(`สร้างออเดอร์ #${data.order.id} สำเร็จ! กรุณาสแกน QR Code พร้อมเพย์เพื่อชำระเงิน`);
        fetchProducts();
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <section id="products" className="py-16 px-4 sm:px-8 bg-white border-b border-neutral-200 font-prompt">
      <div className="max-w-7xl mx-auto">
        
        {/* Toast Alert */}
        <AnimatePresence>
          {orderToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-50 bg-black text-white px-6 py-3 border border-neutral-700 font-kanit text-xs font-semibold flex items-center gap-2 shadow-xl"
            >
              <Check className="w-4 h-4 text-green-400" />
              <span>{orderToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-neutral-200 gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-400 block mb-1">
              NEW ARRIVALS & LIVE INVENTORY
            </span>
            <h2 className="font-prompt font-black text-2xl sm:text-3xl text-black uppercase">
              สินค้าคอลเลกชันใหม่ล่าสุด
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "women", label: "ผู้หญิง" },
              { id: "men", label: "ผู้ชาย" },
              { id: "accessories", label: "เครื่องประดับ & หมวก" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 border transition-all ${
                  activeCategory === tab.id
                    ? "bg-black text-white border-black"
                    : "border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const isLiked = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="studio-product-card flex flex-col justify-between group relative cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {/* 3:4 Aspect Ratio Product Image */}
                <div className="relative aspect-studio-portrait bg-neutral-100 overflow-hidden">
                  <Image
                    src={product.image || '/images/studio_hero_banner.jpg'}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-black text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* QR Code Tag */}
                  <div className="absolute bottom-2 left-2 z-10">
                    <span className="bg-white/90 backdrop-blur-xs text-black font-mono text-[9px] font-bold px-1.5 py-0.5 border border-neutral-300">
                      QR: {product.qrCode}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-red-600 text-red-600" : ""}`} />
                  </button>

                  {/* Hover Quick View */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      เปิดดูรายละเอียด
                    </span>
                  </div>
                </div>

                {/* Product Detail Info */}
                <div className="p-4 font-kanit flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase block mb-1">
                      {product.brand}
                    </span>
                    <h3 className="text-xs font-semibold text-black leading-snug line-clamp-2 mb-2 group-hover:underline">
                      {product.title}
                    </h3>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-neutral-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-black font-prompt">
                        ฿{product.price.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-neutral-500 font-mono">
                        (คลัง: {product.stock})
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCheckout(product);
                      }}
                      className="text-[10px] font-bold uppercase text-black hover:underline tracking-wider"
                    >
                      🛒 ชำระเงินจริง
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Product Quick View Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border border-neutral-300 max-w-2xl w-full p-6 shadow-2xl cursor-default relative font-prompt"
              >
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 p-2 text-black hover:opacity-60"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative aspect-studio-portrait bg-neutral-100 overflow-hidden border border-neutral-200">
                    <Image
                      src={selectedProduct.image || '/images/studio_hero_banner.jpg'}
                      alt={selectedProduct.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-between font-kanit">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">
                          {selectedProduct.brand}
                        </span>
                        <span className="text-[9px] font-mono bg-black text-white font-bold px-1.5 py-0.5">
                          QR: {selectedProduct.qrCode}
                        </span>
                      </div>

                      <h3 className="font-prompt font-bold text-lg text-black mb-2 leading-snug">
                        {selectedProduct.title}
                      </h3>
                      <div className="text-lg font-bold text-black font-prompt mb-3">
                        ฿{selectedProduct.price.toLocaleString()}
                      </div>

                      <p className="text-xs text-neutral-600 font-light leading-relaxed mb-4">
                        {selectedProduct.description}
                      </p>

                      <div className="mb-4 text-xs font-mono">
                        <span className="text-neutral-500">สถานะคลังสินค้าคงเหลือ: </span>
                        <span className="font-bold text-black">{selectedProduct.stock} ชิ้น</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenCheckout(selectedProduct)}
                      className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>สั่งซื้อ & สแกนจ่ายพร้อมเพย์</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real Customer Checkout & PromptPay QR Modal */}
        <AnimatePresence>
          {checkoutProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setCheckoutProduct(null);
                setIsPromptPayOpen(false);
              }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer font-prompt"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border border-neutral-300 max-w-lg w-full p-6 shadow-2xl cursor-default relative font-kanit"
              >
                <button
                  onClick={() => {
                    setCheckoutProduct(null);
                    setIsPromptPayOpen(false);
                  }}
                  className="absolute top-4 right-4 p-2 text-black hover:opacity-60"
                >
                  <X className="w-5 h-5" />
                </button>

                {!isPromptPayOpen ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase">
                        REALTIME CHECKOUT
                      </span>
                    </div>
                    <h3 className="font-prompt font-black text-xl text-black uppercase mb-4">
                      กรอกข้อมูลจัดส่ง & สแกนจ่ายพร้อมเพย์
                    </h3>

                    <div className="p-3 bg-neutral-50 border border-neutral-200 mb-4 flex items-center gap-3">
                      <div className="w-12 h-14 relative bg-neutral-200 shrink-0">
                        <Image src={checkoutProduct.image || '/images/studio_hero_banner.jpg'} alt={checkoutProduct.title} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-black line-clamp-1">{checkoutProduct.title}</h4>
                        <span className="font-prompt font-black text-sm text-black">฿{checkoutProduct.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <form onSubmit={handleConfirmPromptPay} className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-black block mb-1">ชื่อ-นามสกุล ผู้รับ*</label>
                        <input
                          type="text"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          required
                          placeholder="เช่น คุณอนันต์ ชัยเจริญ"
                          className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-black block mb-1">เบอร์โทรศัพท์ติดต่อ*</label>
                        <input
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          required
                          placeholder="เช่น 081-234-5678"
                          className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-mono"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-black block mb-1">ที่อยู่สำหรับจัดส่งสินค้า</label>
                        <textarea
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                          rows={2}
                          placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์..."
                          className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mt-4 font-prompt"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>{isSubmitting ? "กำลังสร้างออเดอร์..." : `ชำระเงินด้วย PromptPay ฿${checkoutProduct.price.toLocaleString()}`}</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <QrCode className="w-6 h-6" />
                    </div>

                    <h3 className="font-prompt font-black text-xl text-black uppercase mb-1">
                      สแกน QR Code พร้อมเพย์เพื่อชำระเงิน
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      เปิดแอปพลิเคชัน Mobile Banking ของทุกธนาคาร เพื่อสแกนชำระเงิน
                    </p>

                    {/* PromptPay QR Simulated Image Card */}
                    <div className="bg-white border-2 border-black p-4 max-w-[220px] mx-auto shadow-md mb-4 text-center">
                      <div className="font-bold text-xs tracking-wider text-blue-900 border-b border-neutral-200 pb-1 mb-2">
                        PROMPTPAY QR
                      </div>
                      <div className="w-40 h-40 bg-neutral-900 text-white font-mono text-[9px] font-bold mx-auto flex flex-col items-center justify-center p-2 rounded-xs">
                        <QrCode className="w-16 h-16 text-white mb-2" />
                        <span>[PROMPTPAY LIVE QR]</span>
                        <span>ยอดชำระ: ฿{checkoutProduct.price.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] font-bold text-black mt-2 font-mono">
                        TUKSHOP CO., LTD.
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-100 text-xs font-semibold text-black mb-4">
                      ยอดชำระสุทธิ: <span className="font-prompt font-black text-sm text-black">฿{checkoutProduct.price.toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => {
                        setCheckoutProduct(null);
                        setIsPromptPayOpen(false);
                        setOrderToast("ชำระเงินสำเร็จ! บันทึกคำสั่งซื้อและส่งข้อมูลเข้าหลังบ้านเรียบร้อยแล้ว");
                      }}
                      className="w-full bg-green-600 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-prompt"
                    >
                      <Check className="w-4 h-4" />
                      <span>ยืนยันชำระเงินเรียบร้อย</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
