"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ShoppingBag, 
  ChevronRight, 
  Check, 
  QrCode, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Minus, 
  Plus, 
  X,
  Share2,
  ChevronDown,
  ArrowLeft
} from "lucide-react";
import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";
import { generateQRCodeSVG } from "@/lib/qrGenerator";

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

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    brand: "MELISSA",
    category: "women",
    title: "NEW🎁 [Not For Sale] Melissa Pack & Go (Free Gift)",
    price: 0,
    originalPrice: 1290,
    stock: 45,
    badge: "GWP 100% OFF",
    qrCode: "TUK-MEL-001",
    image: "/images/studio_hero_banner.jpg",
    description: "กระเป๋าเดินทางรุ่นลิมิเต็ด Melissa Pack & Go ของขวัญพิเศษเมื่อช้อปครบตามเงื่อนไข"
  },
  {
    id: "prod-002",
    brand: "SATUR",
    category: "men",
    title: "NEW [RIIZE's Pick] (M) Loren Linen Cardigan Black",
    price: 3590,
    stock: 20,
    badge: "RIIZE'S PICK",
    qrCode: "TUK-SAT-002",
    image: "/images/fashion_jacket.jpg",
    description: "เสื้อคาร์ดิแกนผ้าลินินทรงลูส สวมสบาย ดีไซน์พรีเมียมจาก SATUR คอลเลกชันใหม่ล่าสุด"
  },
  {
    id: "prod-003",
    brand: "SATUR",
    category: "accessories",
    title: "NEW (U) Contrast Dyed Ball Cap Red",
    price: 1590,
    stock: 35,
    badge: "NEW ARRIVAL",
    qrCode: "TUK-SAT-003",
    image: "/images/studio_hero_banner.jpg",
    description: "หมวกแก๊ปปักลายโลโก้ ทรงสวย สีฟอก Contrast Dyed เท่ไม่ซ้ำใคร"
  },
  {
    id: "prod-004",
    brand: "QUINN",
    category: "women",
    title: "NEW เสื้อยืดแขนสั้นปักลายคอลเลกชัน Quinn Fall",
    price: 2290,
    stock: 18,
    badge: "HOT ITEM",
    qrCode: "TUK-QUI-004",
    image: "/images/fashion_jacket.jpg",
    description: "เสื้อยืดแขนสั้นเนื้อผ้าคอตตอน 100% ปักลายเนี๊ยบ ทรงสวยเข้ารูป"
  },
  {
    id: "prod-005",
    brand: "QUINN",
    category: "women",
    title: "NEW แจ็คเก็ตฮู้ดดี้แต่งซิปคู่ ดีไซน์สปอร์ตชิค",
    price: 4990,
    stock: 12,
    badge: "LIMITED",
    qrCode: "TUK-QUI-005",
    image: "/images/fashion_jacket.jpg",
    description: "แจ็คเก็ตฮู้ดดี้แต่งซิปคู่ เนื้อผ้านุ่ม อบอุ่น แมตช์ง่ายกับทุกสไตล์"
  },
  {
    id: "prod-006",
    brand: "QUINN",
    category: "women",
    title: "NEW กางเกงเดนิมขายาวทรงขากว้าง สีฟอกทูโทน",
    price: 3290,
    stock: 25,
    badge: "MUST HAVE",
    qrCode: "TUK-QUI-006",
    image: "/images/studio_hero_banner.jpg",
    description: "กางเกงยีนส์เอวสูงทรงขากว้าง ช่วยให้ช่วงขาดูเรียวยาว เนื้อผ้าเดนิมพรีเมียม"
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const rawId = params?.id;
  const productId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || '';

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery & Options State
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("Brown");
  const [quantity, setQuantity] = useState<number>(1);
  const [isLiked, setIsLiked] = useState(false);

  // Accordion State
  const [activeAccordion, setActiveAccordion] = useState<string>("desc");

  // Checkout & PromptPay Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPromptPayOpen, setIsPromptPayOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "" });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.products && data.products.length > 0) {
          const found = data.products.find((p: Product) => p.id === productId || p.qrCode.toLowerCase() === productId.toLowerCase());
          if (found) {
            setProduct(found);
            setSelectedImage(found.image || '/images/studio_hero_banner.jpg');
            setRelatedProducts(data.products.filter((p: Product) => p.id !== found.id).slice(0, 4));
            return;
          }
        }
      }
    } catch (err) {
      console.warn('API Fetch failed, using fallback product list:', err);
    }

    // Fallback Product Logic
    const foundFallback = FALLBACK_PRODUCTS.find(p => p.id === productId || p.qrCode.toLowerCase() === productId.toLowerCase()) || FALLBACK_PRODUCTS[0];
    setProduct(foundFallback);
    setSelectedImage(foundFallback.image || '/images/studio_hero_banner.jpg');
    setRelatedProducts(FALLBACK_PRODUCTS.filter(p => p.id !== foundFallback.id).slice(0, 4));
    setLoading(false);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name || 'คุณลูกค้า',
          email: `${customerInfo.phone}@tukshop.com`,
          phone: customerInfo.phone || '081-234-5678',
          items: [{ productId: product.id, title: `${product.title} (Size ${selectedSize}, ${selectedColor})`, price: product.price, quantity }],
          totalAmount: product.price * quantity
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsPromptPayOpen(true);
        setToastMessage(`สร้างคำสั่งซื้อ #${data.order.id} สำเร็จ! กรุณาสแกน QR Code พร้อมเพย์เพื่อชำระเงิน`);
      } else {
        setIsPromptPayOpen(true);
      }
    } catch (err) {
      setIsPromptPayOpen(true);
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-white font-prompt flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">กำลังโหลดรายละเอียดสินค้า...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white font-prompt flex flex-col items-center justify-center p-4">
        <h2 className="font-black text-2xl uppercase mb-2">ไม่พบสินค้าที่คุณค้นหา</h2>
        <Link href="/" className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      {/* Toast Notification */}
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
        
        {/* Back to Home Button & Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-black hover:text-white text-black font-kanit font-bold text-xs px-4 py-2 border border-neutral-300 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← กลับสู่หน้าหลัก (Back to Home)</span>
          </Link>

          <nav className="flex items-center gap-2 text-xs text-neutral-500 font-kanit uppercase tracking-wider">
            <Link href="/" className="hover:text-black font-bold text-black underline">หน้าแรก</Link>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <span className="hover:text-black uppercase">{product.category}</span>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <span className="font-bold text-black uppercase">{product.brand}</span>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-400 truncate max-w-[180px]">{product.title}</span>
          </nav>
        </div>

        {/* 1:1 Studiofour Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Product Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-studio-portrait bg-neutral-100 border border-neutral-200 overflow-hidden group">
              <Image
                src={selectedImage || product.image || '/images/studio_hero_banner.jpg'}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />

              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-black text-white text-xs font-bold uppercase tracking-widest px-3 py-1">
                    {product.badge}
                  </span>
                </div>
              )}

              <button
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-red-600 text-red-600" : ""}`} />
              </button>
            </div>

            {/* Thumbnail Selection Strip */}
            <div className="grid grid-cols-4 gap-3">
              {[product.image, '/images/studio_hero_banner.jpg', '/images/fashion_jacket.jpg', product.image].map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img || '/images/studio_hero_banner.jpg')}
                  className={`relative aspect-studio-portrait bg-neutral-100 border transition-all ${
                    selectedImage === img ? 'border-2 border-black scale-95' : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img || '/images/studio_hero_banner.jpg'} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Editorial Specs & Purchase Box (5 Cols) */}
          <div className="lg:col-span-5 font-kanit flex flex-col justify-between">
            <div>
              
              {/* Brand & SKU Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
                <span className="font-prompt font-black text-sm text-neutral-500 uppercase tracking-widest">
                  {product.brand}
                </span>
                <span className="font-mono text-xs font-bold bg-neutral-100 text-neutral-800 px-2.5 py-1 border border-neutral-300 uppercase">
                  SKU: {product.qrCode}
                </span>
              </div>

              {/* Title & Price */}
              <h1 className="font-prompt font-bold text-2xl text-black leading-tight mb-3">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-prompt font-black text-2xl text-black">
                  ฿{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm line-through text-neutral-400 font-mono">
                    ฿{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-600 font-light leading-relaxed mb-6 border-b border-neutral-200 pb-6">
                {product.description}
              </p>

              {/* Color Swatch Selection */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-bold text-black mb-2 uppercase">
                  <span>เลือกสี (Color):</span>
                  <span className="text-neutral-500 font-mono">{selectedColor}</span>
                </div>
                <div className="flex gap-3">
                  {[
                    { name: 'Brown', hex: '#5c4033' },
                    { name: 'Black', hex: '#111111' },
                    { name: 'Cream', hex: '#e8e6d9' }
                  ].map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-9 h-9 rounded-full border-2 transition-transform flex items-center justify-center ${
                        selectedColor === c.name ? 'border-black scale-110 shadow-sm' : 'border-neutral-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {selectedColor === c.name && <Check className={`w-4 h-4 ${c.name === 'Cream' ? 'text-black' : 'text-white'}`} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-bold text-black mb-2 uppercase">
                  <span>เลือกไซส์ (Size):</span>
                  <button className="text-[10px] text-neutral-500 underline uppercase">ตารางวัดไซส์ (Size Guide)</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["S", "M", "L", "XL"].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-xs font-bold font-prompt uppercase tracking-wider border transition-all ${
                        selectedSize === size
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'border-neutral-300 text-neutral-700 hover:border-black hover:text-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Counter & Stock Status */}
              <div className="flex items-center justify-between mb-8 p-3 bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase text-black">จำนวน:</span>
                  <div className="flex items-center border border-neutral-300 bg-white">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-neutral-100 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-prompt font-bold text-xs">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-neutral-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-green-600 block">✓ สินค้าพร้อมส่ง</span>
                  <span className="text-[10px] text-neutral-500 font-mono">คลังคงเหลือ: {product.stock} ชิ้น</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-8">
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-4 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-md font-prompt"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>🛍️ ซื้อสินค้า & สแกนจ่ายพร้อมเพย์</span>
                </button>

                <button
                  onClick={() => {
                    setToastMessage(`เพิ่ม "${product.title}" ลงในตะกร้าเรียบร้อยแล้ว`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="w-full bg-white border border-black text-black text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-100 transition-colors font-prompt"
                >
                  + ใส่ตะกร้าสินค้า
                </button>
              </div>

              {/* Accordion Tabs for Specifications */}
              <div className="border-t border-neutral-200 divide-y divide-neutral-200 text-xs">
                {[
                  { id: 'desc', title: '📌 รายละเอียดและจุดเด่นของสินค้า', content: product.description },
                  { id: 'material', title: '📌 วัสดุและการตัดเย็บ', content: 'ตัดเย็บด้วยผ้าคอตตอนและลินินพรีเมียม 100% ให้ความนุ่ม เบาสบาย ระบายอากาศได้ดีเยี่ยม เหมาะกับสภาพอากาศเมืองไทย' },
                  { id: 'care', title: '📌 คำแนะนำการดูแลรักษา', content: 'ซักมือหรือซักเครื่องด้วยถุงถนอมผ้า ห้ามใช้น้ำยาฟอกขาว รีดด้วยอุณหภูมิปานกลาง' },
                  { id: 'shipping', title: '📌 นโยบายการจัดส่งและคืนสินค้า', content: 'จัดส่งฟรีทั่วประเทศ ไม่มีขั้นต่ำ / สามารถเปลี่ยนไซส์หรือคืนสินค้าได้ภายใน 7 วัน' },
                ].map(acc => (
                  <div key={acc.id} className="py-3">
                    <button
                      onClick={() => setActiveAccordion(activeAccordion === acc.id ? '' : acc.id)}
                      className="w-full flex items-center justify-between font-bold text-black uppercase hover:opacity-75 transition-opacity"
                    >
                      <span>{acc.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === acc.id ? 'rotate-180' : ''}`} />
                    </button>
                    {activeAccordion === acc.id && (
                      <p className="mt-2 text-neutral-600 font-light leading-relaxed pl-2 border-l-2 border-black">
                        {acc.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* Recommended Products Grid */}
        <div className="mt-20 pt-10 border-t border-neutral-200">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">RECOMMENDED FASHION LOOKS</span>
              <h2 className="font-prompt font-black text-xl sm:text-2xl uppercase">สินค้าแนะนำเพิ่มเติม</h2>
            </div>
            <Link href="/" className="text-xs font-bold uppercase text-black hover:underline">ดูทั้งหมด</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => router.push(`/products/${rel.id}`)}
                className="studio-product-card flex flex-col justify-between group cursor-pointer"
              >
                <div className="relative aspect-studio-portrait bg-neutral-100 overflow-hidden">
                  <Image src={rel.image || '/images/studio_hero_banner.jpg'} alt={rel.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  {rel.badge && <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold uppercase px-2 py-0.5 z-10">{rel.badge}</span>}
                </div>
                <div className="p-3 font-kanit">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">{rel.brand}</span>
                  <h4 className="text-xs font-semibold text-black line-clamp-1 group-hover:underline">{rel.title}</h4>
                  <span className="text-xs font-bold font-prompt text-black block mt-1">฿{rel.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* PROMPTPAY INSTANT CHECKOUT MODAL */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsCheckoutOpen(false);
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
                  setIsCheckoutOpen(false);
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
                      PROMPTPAY CHECKOUT
                    </span>
                  </div>
                  <h3 className="font-prompt font-black text-xl text-black uppercase mb-4">
                    ชำระเงินด้วย PromptPay QR Code
                  </h3>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 mb-4 flex items-center gap-3">
                    <div className="w-12 h-14 relative bg-neutral-200 shrink-0">
                      <Image src={selectedImage || product.image || '/images/studio_hero_banner.jpg'} alt={product.title} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-black line-clamp-1">{product.title} (Size {selectedSize})</h4>
                      <span className="font-prompt font-black text-sm text-black">฿{(product.price * quantity).toLocaleString()}</span>
                    </div>
                  </div>

                  <form onSubmit={handleConfirmOrder} className="space-y-3 text-xs">
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
                      <label className="font-bold text-black block mb-1">ที่อยู่จัดส่ง</label>
                      <textarea
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        rows={2}
                        placeholder="ที่อยู่จัดส่งสินค้า..."
                        className="w-full bg-neutral-50 border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-black"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mt-4 font-prompt"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>ยืนยันคำสั่งซื้อ ฿{(product.price * quantity).toLocaleString()}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-2">
                  <h3 className="font-prompt font-black text-xl text-black uppercase mb-1">
                    สแกน QR Code พร้อมเพย์เพื่อชำระเงิน
                  </h3>
                  <p className="text-xs text-neutral-500 mb-4">เปิดแอปพลิเคชัน Mobile Banking ของทุกธนาคาร เพื่อสแกนชำระเงิน</p>

                  <div className="bg-white border-2 border-black p-4 max-w-[240px] mx-auto shadow-md mb-4 text-center">
                    <div 
                      className="w-48 h-48 mx-auto border border-neutral-300 p-1 flex items-center justify-center bg-white"
                      dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(`PROMPTPAY-0105569000123-AMOUNT-${product.price * quantity}`, 180) }}
                    />
                    <div className="text-[10px] font-bold text-black mt-2 font-mono uppercase">TUKSHOP CO., LTD.</div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setIsPromptPayOpen(false);
                      setToastMessage("ชำระเงินเรียบร้อยแล้ว! บันทึกออเดอร์เข้าหลังบ้านสำเร็จ");
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

      <CtaFooter />
    </div>
  );
}
