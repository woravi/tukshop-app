"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Heart, ShoppingBag, Eye, ArrowRight, X, Check, QrCode } from "lucide-react";

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
  const [orderToast, setOrderToast] = useState<string | null>(null);

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

  const handleAddToCart = async (product: Product) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'คุณอนันต์ ชัยเจริญ (หน้าร้าน)',
          email: 'anan@gmail.com',
          phone: '081-234-5678',
          items: [{ productId: product.id, title: product.title, price: product.price, quantity: 1 }],
          totalAmount: product.price
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrderToast(`เพิ่ม "${product.title}" ลงในออเดอร์แล้ว! บันทึกเข้าหลังบ้านและตัดสต็อกเรียบร้อย`);
        setTimeout(() => setOrderToast(null), 4000);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error('Checkout error:', err);
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
              สินค้าใหม่ล่าสุด (เชื่อมต่อหลังบ้าน)
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

        {/* Studiofour Product Cards Grid */}
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

                  {/* QR Code Label Tag */}
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
                        handleAddToCart(product);
                      }}
                      className="text-[10px] font-bold uppercase text-black hover:underline tracking-wider"
                    >
                      + สั่งซื้อ
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
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>สั่งซื้อและบันทึกข้อมูลเข้าหลังบ้าน</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
