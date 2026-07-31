"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: "prod-005",
      brand: "QUINN",
      title: "NEW แจ็คเก็ตฮู้ดดี้แต่งซิปคู่ ดีไซน์สปอร์ตชิค",
      price: 4990,
      image: "/images/fashion_jacket.jpg",
      qrCode: "TUK-QUI-005"
    },
    {
      id: "prod-002",
      brand: "SATUR",
      title: "NEW [RIIZE's Pick] (M) Loren Linen Cardigan Black",
      price: 3590,
      image: "/images/fashion_jacket.jpg",
      qrCode: "TUK-SAT-002"
    }
  ]);

  const removeItem = (id: string) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-20">
        <h1 className="font-prompt font-black text-2xl sm:text-3xl uppercase mb-8 pb-4 border-b border-neutral-200">
          รายการสินค้าที่ชอบ (My Wishlist)
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="py-20 text-center font-kanit">
            <Heart className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
            <h3 className="font-bold text-lg text-black mb-2">ยังไม่มีสินค้าในรายการที่ชอบของคุณ</h3>
            <p className="text-xs text-neutral-500 mb-6">กดรูปหัวใจบนการ์ดสินค้าเพื่อบันทึกไว้ดูภายหลัง</p>
            <Link href="/" className="bg-black text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 inline-block">
              กลับไปเลือกสินค้า
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="studio-product-card flex flex-col justify-between group relative">
                <div 
                  onClick={() => router.push(`/products/${item.id}`)}
                  className="relative aspect-studio-portrait bg-neutral-100 overflow-hidden cursor-pointer"
                >
                  <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-red-600 hover:bg-black hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 font-kanit flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block mb-1">{item.brand}</span>
                    <h3 onClick={() => router.push(`/products/${item.id}`)} className="text-xs font-semibold text-black line-clamp-2 mb-2 cursor-pointer hover:underline">
                      {item.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <span className="font-prompt font-black text-sm text-black block">฿{item.price.toLocaleString()}</span>
                    <button
                      onClick={() => router.push(`/products/${item.id}`)}
                      className="w-full bg-black text-white text-[10px] font-bold uppercase tracking-wider py-2 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1 font-prompt"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>สั่งซื้อสินค้า</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CtaFooter />
    </div>
  );
}
