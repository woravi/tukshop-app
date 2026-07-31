"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && data.products) setProducts(data.products);
    } catch (err) {
      console.error("Search fetch error:", err);
    }
  };

  const filteredProducts = products.filter(p => 
    !query || 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.brand.toLowerCase().includes(query.toLowerCase()) ||
    p.qrCode.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-20">
        
        <h1 className="font-prompt font-black text-2xl sm:text-3xl uppercase mb-6 text-center">
          ค้นหาสินค้า (Search Products)
        </h1>

        {/* Big Search Input */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="พิมพ์ชื่อสินค้า แบรนด์ (QUINN, SATUR, MELISSA) หรือรหัส QR..."
              className="w-full bg-neutral-50 border-2 border-black text-sm px-5 py-4 pl-12 focus:outline-none font-kanit shadow-md"
              autoFocus
            />
            <Search className="w-5 h-5 absolute left-4 top-4 text-neutral-500" />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map(p => (
            <div
              key={p.id}
              onClick={() => router.push(`/products/${p.id}`)}
              className="studio-product-card flex flex-col justify-between group cursor-pointer"
            >
              <div className="relative aspect-studio-portrait bg-neutral-100 overflow-hidden">
                <Image src={p.image || "/images/studio_hero_banner.jpg"} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-black font-mono text-[9px] font-bold px-1.5 py-0.5 border border-neutral-300">
                  {p.qrCode}
                </span>
              </div>
              <div className="p-4 font-kanit">
                <span className="text-[9px] font-mono text-neutral-500 uppercase block">{p.brand}</span>
                <h3 className="text-xs font-semibold text-black line-clamp-2 mb-2 group-hover:underline">{p.title}</h3>
                <span className="font-prompt font-black text-sm text-black block">฿{p.price.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

      </main>

      <CtaFooter />
    </div>
  );
}
