"use client";

import { motion } from "framer-motion";

export default function StatsTicker() {
  const brands = [
    { name: "QUINN", cat: "CLOTHING & ACCESSORIES", href: "#products" },
    { name: "LNRD Signature", cat: "LUXURY ESSENTIALS", href: "#products" },
    { name: "MARITHÉ", cat: "FRANÇOIS GIRBAUD", href: "#products" },
    { name: "MELISSA", cat: "JELLY SHOES & BAGS", href: "#products" },
    { name: "IPANEMA", cat: "FLIP FLOPS", href: "#products" },
    { name: "REEF", cat: "SURF & FOOTWEAR", href: "#products" },
    { name: "HOLSTER", cat: "AUSTRALIAN FOOTWEAR", href: "#products" },
    { name: "DIESEL", cat: "DENIM & APPAREL", href: "#products" },
    { name: "PUMA", cat: "SPORTSTYLE", href: "#products" },
    { name: "SATUR [SOON]", cat: "K-FASHION PREVIEW", href: "#products" },
  ];

  return (
    <section id="brands" className="py-16 px-4 sm:px-8 bg-neutral-50 border-b border-neutral-200 font-prompt">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-400 block mb-1">
            OUR ICONIC BRANDS
          </span>
          <h2 className="font-prompt font-black text-2xl sm:text-3xl text-black uppercase">
            แบรนด์ไอคอนิกชั้นนำ
          </h2>
          <p className="font-kanit text-xs text-neutral-500 font-light mt-1">
            คัดสรรแบรนด์แฟชั่นระดับโลกเพื่อสไตล์ที่เป็นคุณ
          </p>
        </div>

        {/* Brand Grid Boxes - Studiofour Exact Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {brands.map((brand, idx) => (
            <a
              key={idx}
              href={brand.href}
              className="bg-white border border-neutral-200 p-6 flex flex-col justify-between items-center text-center hover:border-black hover:bg-black hover:text-white transition-all duration-300 group shadow-2xs h-32"
            >
              <div className="flex-1 flex items-center justify-center">
                <span className="font-prompt font-black text-lg sm:text-xl tracking-tight uppercase group-hover:scale-105 transition-transform">
                  {brand.name}
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-neutral-400 group-hover:text-neutral-300 uppercase">
                {brand.cat}
              </span>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
