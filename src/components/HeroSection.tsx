"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="hero" className="pt-28 lg:pt-36 bg-white font-prompt">
      {/* 1. Main Full-Bleed Fashion Campaign Banner */}
      <div className="relative w-full aspect-[16/9] max-h-[640px] bg-neutral-900 overflow-hidden group">
        <Image
          src="/images/studio_hero_banner.jpg"
          alt="TukShop Campaign Banner"
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-103"
          priority
        />

        {/* Studiofour Style Editorial Overlay Text & Action */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-12 lg:p-16 text-white">
          <div className="max-w-4xl">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase bg-white text-black px-3 py-1 mb-4 inline-block">
              NEW SEASON COLLECTION 2026
            </span>
            <h1 className="font-prompt font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-tight mb-4">
              TukShop <br />
              <span className="font-light italic tracking-normal text-neutral-300">DIGITAL BOUTIQUE</span>
            </h1>
            <p className="font-kanit text-sm sm:text-lg text-neutral-200 max-w-2xl font-light mb-8 leading-relaxed hidden sm:block">
              ห้องเสื้อดิจิทัลที่รวมแบรนด์ไอคอนิกและคอลเลกชันแฟชั่นระดับโลกเข้าด้วยกัน เปลี่ยนการค้นหาให้กลายเป็นการเดินทางที่เต็มไปด้วยแรงบันดาลใจ
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#products"
                className="bg-white text-black text-xs font-bold uppercase tracking-widest px-8 py-3.5 hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg"
              >
                <span>ชมสินค้าทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#brands"
                className="border border-white text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 hover:bg-white hover:text-black transition-colors"
              >
                ดูแบรนด์ทั้งหมด
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub Banners Bar (matching Studiofour: SATUR, QUINN, REEF previews) */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider">
        
        <a href="#products" className="p-6 border-b md:border-b-0 md:border-r border-neutral-200 flex items-center justify-between hover:bg-neutral-50 transition-colors group">
          <div>
            <span className="text-[10px] text-neutral-400 font-mono block mb-1">SATUR SPECIAL PREVIEW</span>
            <span className="font-bold text-black group-hover:underline">ชมพรีวิวสินค้า SATUR และลงทะเบียน</span>
          </div>
          <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
        </a>

        <a href="#products" className="p-6 border-b md:border-b-0 md:border-r border-neutral-200 flex items-center justify-between hover:bg-neutral-50 transition-colors group">
          <div>
            <span className="text-[10px] text-neutral-400 font-mono block mb-1">QUINN FALL COLLECTION</span>
            <span className="font-bold text-black group-hover:underline">ชมสินค้าคอลเลกชัน QUINN FALL 26</span>
          </div>
          <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
        </a>

        <a href="#products" className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors group">
          <div>
            <span className="text-[10px] text-neutral-400 font-mono block mb-1">REEF FOOTWEAR</span>
            <span className="font-bold text-black group-hover:underline">ชมสินค้า REEF ล่าสุด</span>
          </div>
          <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
        </a>

      </div>
    </section>
  );
}
