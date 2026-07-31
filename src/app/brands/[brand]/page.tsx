"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";

export default function BrandShowcasePage() {
  const params = useParams();
  const router = useRouter();
  const brandName = ((params?.brand as string) || "QUINN").toUpperCase();

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [brandName]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products.filter((p: any) => p.brand.toUpperCase() === brandName));
      }
    } catch (err) {
      console.error("Brand fetch error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-20">
        
        {/* Brand Banner Header */}
        <div className="bg-black text-white p-10 sm:p-16 mb-10 text-center relative overflow-hidden">
          <span className="text-xs font-mono font-bold tracking-widest text-neutral-400 block mb-2">
            EXCLUSIVE BRAND SHOWCASE
          </span>
          <h1 className="font-prompt font-black text-3xl sm:text-5xl uppercase mb-4 tracking-widest">
            {brandName}
          </h1>
          <p className="font-kanit text-xs text-neutral-300 max-w-lg mx-auto font-light">
            สัมผัสงานคราฟต์แฟชั่นระดับพรีเมียมจากแบรนด์ {brandName} คอลเลกชันใหม่ส่งตรงจากรันเวย์
          </p>
        </div>

        {/* Brand Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map(p => (
            <div
              key={p.id}
              onClick={() => router.push(`/products/${p.id}`)}
              className="studio-product-card flex flex-col justify-between group cursor-pointer"
            >
              <div className="relative aspect-studio-portrait bg-neutral-100 overflow-hidden">
                <Image src={p.image || "/images/studio_hero_banner.jpg"} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute bottom-2 left-2 bg-white/90 text-black font-mono text-[9px] font-bold px-1.5 py-0.5 border border-neutral-300">
                  {p.qrCode}
                </span>
              </div>
              <div className="p-4 font-kanit">
                <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block">{p.brand}</span>
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
