"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Filter, ArrowUpDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";

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

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryParam = (params?.category as string) || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "lowToHigh" | "highToLow">("featured");

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryParam]);

  const fetchCategoryProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "women": return "สินค้าสำหรับผู้หญิง (Women's Collection)";
      case "men": return "สินค้าสำหรับผู้ชาย (Men's Collection)";
      case "accessories": return "แอคเซสเซอรี่ & หมวก (Accessories)";
      case "new-arrivals": return "สินค้ามาใหม่ล่าสุด (New Arrivals)";
      case "sale": return "สินค้าลดราคาพิเศษ (Sale & Offers)";
      default: return "คอลเลกชันสินค้าทั้งหมด (All Collections)";
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    const matchCat = categoryParam === "all" || 
      (categoryParam === "new-arrivals" ? p.badge?.includes("NEW") : 
      categoryParam === "sale" ? (p.originalPrice || 0) > p.price : 
      p.category.toLowerCase() === categoryParam.toLowerCase());
    
    const matchBrand = selectedBrand === "all" || p.brand.toUpperCase() === selectedBrand.toUpperCase();
    return matchCat && matchBrand;
  }).sort((a, b) => {
    if (sortBy === "lowToHigh") return a.price - b.price;
    if (sortBy === "highToLow") return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-20">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 font-kanit mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-black">หน้าแรก</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black font-bold uppercase">{categoryParam}</span>
        </nav>

        {/* Category Header Banner */}
        <div className="bg-neutral-900 text-white p-8 sm:p-12 mb-10 border border-black relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 block mb-2 uppercase">
              STUDIOFOUR EXCLUSIVE COLLECTION
            </span>
            <h1 className="font-prompt font-black text-2xl sm:text-4xl uppercase mb-3">
              {getCategoryTitle(categoryParam)}
            </h1>
            <p className="font-kanit text-xs text-neutral-300 font-light max-w-xl">
              เลือกสรรดีไซน์ความโดดเด่นจากแบรนด์ระดับพรีเมียม QUINN, SATUR และ MELISSA พร้อมส่งตรงถึงบ้านคุณ
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-neutral-800 to-transparent opacity-50" />
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-200 font-kanit text-xs">
          
          {/* Brand Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="font-bold text-black uppercase flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> แบรนด์:
            </span>
            {["all", "QUINN", "SATUR", "MELISSA"].map(brand => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1.5 border transition-all text-xs uppercase font-mono font-bold ${
                  selectedBrand === brand
                    ? "bg-black text-white border-black"
                    : "border-neutral-200 text-neutral-600 hover:border-black"
                }`}
              >
                {brand === "all" ? "ทั้งหมด" : brand}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-black uppercase flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> เรียงตาม:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-neutral-300 text-xs px-3 py-1.5 focus:outline-none focus:border-black font-kanit"
            >
              <option value="featured">สินค้าแนะนำ</option>
              <option value="lowToHigh">ราคา: ต่ำไปสูง</option>
              <option value="highToLow">ราคา: สูงไปต่ำ</option>
            </select>
          </div>

        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-neutral-500 uppercase tracking-widest">
            กำลังโหลดข้อมูลสินค้าในหมวดหมู่...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center font-kanit">
            <h3 className="font-bold text-lg text-black mb-2">ไม่พบสินค้าในหมวดหมู่นี้</h3>
            <p className="text-xs text-neutral-500 mb-6">ลองเปลี่ยนการกรอกเงื่อนไขค้นหาหรือเลือกดูสินค้าทั้งหมด</p>
            <button
              onClick={() => { setSelectedBrand("all"); setSortBy("featured"); }}
              className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3"
            >
              รีเซ็ตการค้นหา
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(p => (
              <div
                key={p.id}
                onClick={() => router.push(`/products/${p.id}`)}
                className="studio-product-card flex flex-col justify-between group cursor-pointer"
              >
                <div className="relative aspect-studio-portrait bg-neutral-100 overflow-hidden">
                  <Image
                    src={p.image || "/images/studio_hero_banner.jpg"}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {p.badge && (
                    <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold uppercase px-2 py-0.5 z-10">
                      {p.badge}
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-black font-mono text-[9px] font-bold px-1.5 py-0.5 border border-neutral-300">
                    {p.qrCode}
                  </span>
                </div>

                <div className="p-4 font-kanit flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block mb-1">
                      {p.brand}
                    </span>
                    <h3 className="text-xs font-semibold text-black line-clamp-2 mb-2 group-hover:underline">
                      {p.title}
                    </h3>
                  </div>

                  <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-neutral-100">
                    <span className="font-prompt font-black text-sm text-black">
                      ฿{p.price.toLocaleString()}
                    </span>
                    {p.originalPrice && (
                      <span className="text-[10px] line-through text-neutral-400 font-mono">
                        ฿{p.originalPrice.toLocaleString()}
                      </span>
                    )}
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
