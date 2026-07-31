"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Minus, Plus, Trash2, Check, QrCode, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";
import { generateQRCodeSVG } from "@/lib/qrGenerator";

interface CartItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
  qrCode: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "prod-005",
      title: "NEW แจ็คเก็ตฮู้ดดี้แต่งซิปคู่ ดีไซน์สปอร์ตชิค",
      brand: "QUINN",
      price: 4990,
      quantity: 1,
      size: "M",
      color: "Brown",
      image: "/images/fashion_jacket.jpg",
      qrCode: "TUK-QUI-005"
    },
    {
      id: "prod-002",
      title: "NEW [RIIZE's Pick] (M) Loren Linen Cardigan Black",
      brand: "SATUR",
      price: 3590,
      quantity: 1,
      size: "L",
      color: "Black",
      image: "/images/fashion_jacket.jpg",
      qrCode: "TUK-SAT-002"
    }
  ]);

  // Discount Code & Order Info
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Customer Checkout Form State
  const [customerName, setCustomerName] = useState("คุณอนันต์ ชัยเจริญ");
  const [phone, setPhone] = useState("081-234-5678");
  const [address, setAddress] = useState("99/9 อาคารสยามพารากอน ชั้น 2 ถนนพระราม 1 เขตปทุมวัน กรุงเทพฯ 10330");

  // PromptPay Modal
  const [isPromptPayOpen, setIsPromptPayOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const updateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  const applyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "WELCOME10") {
      setDiscountPercent(10);
      setPromoMessage("ใช้โค้ด WELCOME10 สำเร็จ! รับส่วนลด 10%");
    } else {
      setPromoMessage("โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ");
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          email: `${phone}@tukshop.com`,
          phone,
          items: cartItems.map(i => ({ productId: i.id, title: `${i.title} (Size ${i.size})`, price: i.price, quantity: i.quantity })),
          totalAmount
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsPromptPayOpen(true);
      } else {
        setIsPromptPayOpen(true);
      }
    } catch (err) {
      setIsPromptPayOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-black text-white px-6 py-3 border border-neutral-700 font-kanit text-xs font-semibold flex items-center gap-2 shadow-xl"
          >
            <Check className="w-4 h-4 text-green-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-20">
        
        <h1 className="font-prompt font-black text-2xl sm:text-3xl uppercase mb-8 pb-4 border-b border-neutral-200">
          ตะกร้าสินค้าและการชำระเงิน (Shopping Bag & Checkout)
        </h1>

        {cartItems.length === 0 ? (
          <div className="py-20 text-center font-kanit">
            <ShoppingBag className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
            <h3 className="font-bold text-lg text-black mb-2">ไม่มีสินค้าในตะกร้าของคุณ</h3>
            <p className="text-xs text-neutral-500 mb-6">เลือกช้อปสินค้าแฟชั่นคอลเลกชันใหม่จาก TukShop</p>
            <Link href="/" className="bg-black text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 inline-block">
              กลับไปเลือกสินค้า
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Cart Items List (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-neutral-50 border border-neutral-200 p-3 text-xs font-kanit font-semibold flex items-center gap-2 text-green-700">
                <Truck className="w-4 h-4" />
                <span>คุณได้รับสิทธิ์ <b>จัดส่งฟรีทั่วประเทศ</b> สำหรับออเดอร์นี้!</span>
              </div>

              <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 items-center justify-between">
                    <div className="w-20 h-24 relative bg-neutral-100 border border-neutral-200 shrink-0">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>

                    <div className="flex-1 font-kanit">
                      <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block">{item.brand}</span>
                      <h3 className="font-bold text-xs text-black line-clamp-1">{item.title}</h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">ไซส์: {item.size} | สี: {item.color}</p>
                      <span className="font-prompt font-black text-sm text-black block mt-1">฿{item.price.toLocaleString()}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center border border-neutral-300 bg-white">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-neutral-100">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-prompt font-bold text-xs">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-neutral-100">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button onClick={() => updateQuantity(item.id, 0)} className="p-2 text-neutral-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo Code Box */}
              <form onSubmit={applyPromoCode} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="กรอกโค้ดส่วนลด (ลอง: WELCOME10)"
                  className="flex-1 bg-white border border-neutral-300 text-xs px-3 py-2.5 uppercase font-mono focus:outline-none focus:border-black font-kanit"
                />
                <button type="submit" className="bg-black text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5">
                  ใช้โค้ด
                </button>
              </form>
              {promoMessage && <p className="text-xs font-kanit text-blue-600 font-semibold">{promoMessage}</p>}

            </div>

            {/* Right Column: Checkout Summary & Form (5 Cols) */}
            <div className="lg:col-span-5 font-kanit">
              <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-6">
                
                <h3 className="font-prompt font-black text-lg text-black uppercase pb-3 border-b border-neutral-200">
                  สรุปคำสั่งซื้อ (Order Summary)
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>ราคารวมสินค้า:</span>
                    <span className="font-mono text-black">฿{subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>ส่วนลดโค้ด ({discountPercent}%):</span>
                      <span className="font-mono">-฿{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>ค่าจัดส่ง:</span>
                    <span className="font-mono text-green-600 font-bold">ฟรี</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-black pt-3 border-t border-neutral-200">
                    <span>ยอดชำระสุทธิ:</span>
                    <span className="font-prompt font-black text-lg text-black">฿{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Shipping Details Form */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-3 pt-4 border-t border-neutral-200 text-xs">
                  <div>
                    <label className="font-bold text-black block mb-1">ชื่อผู้รับสินค้า*</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full bg-white border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-kanit"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-black block mb-1">เบอร์โทรศัพท์*</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full bg-white border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-black block mb-1">ที่อยู่จัดส่ง*</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      required
                      className="w-full bg-white border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black font-kanit"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-4 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mt-4 font-prompt shadow-md"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>ชำระเงินด้วย PromptPay QR (฿{totalAmount.toLocaleString()})</span>
                  </button>
                </form>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* PROMPTPAY MODAL */}
      <AnimatePresence>
        {isPromptPayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer font-prompt"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-black max-w-sm w-full p-6 shadow-2xl cursor-default relative text-center"
            >
              <h3 className="font-black text-xl text-black uppercase mb-1">
                สแกน QR Code พร้อมเพย์
              </h3>
              <p className="text-xs text-neutral-500 font-kanit mb-4">เปิดแอปพลิเคชัน Mobile Banking ทุกธนาคารเพื่อสแกนชำระเงิน</p>

              <div className="bg-white p-3 border-2 border-black max-w-[240px] mx-auto shadow-md mb-4 flex items-center justify-center">
                <div 
                  className="w-[200px] h-[200px] flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(`PROMPTPAY-0105569000123-AMOUNT-${totalAmount}`, 190) }}
                />
              </div>

              <div className="p-3 bg-neutral-100 border border-neutral-300 font-kanit text-xs font-bold text-black mb-4">
                ยอดชำระ: ฿{totalAmount.toLocaleString()}
              </div>

              <button
                onClick={() => {
                  setIsPromptPayOpen(false);
                  setCartItems([]);
                  setToastMessage("ชำระเงินสำเร็จ! บันทึกคำสั่งซื้อเข้าหลังบ้านเรียบร้อย");
                }}
                className="w-full bg-green-600 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-prompt"
              >
                <Check className="w-4 h-4" />
                <span>ยืนยันชำระเงินเสร็จสิ้น</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CtaFooter />
    </div>
  );
}
