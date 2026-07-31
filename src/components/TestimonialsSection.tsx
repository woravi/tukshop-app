"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Heart, Award } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-8 bg-white border-b border-neutral-200 font-prompt">
      <div className="max-w-5xl mx-auto text-center">
        
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-black text-white px-3 py-1 inline-block mb-4">
          ABOUT TUKSHOP
        </span>

        <h2 className="font-prompt font-black text-3xl sm:text-5xl text-black uppercase tracking-tight mb-6">
          เกี่ยวกับ TukShop
        </h2>

        <p className="font-kanit text-neutral-700 text-base sm:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-12">
          TukShop คือ <strong className="text-black font-semibold">ห้องเสื้อดิจิทัลที่รวมแบรนด์ไอคอนิกเข้าด้วยกัน</strong> ออกแบบมาสำหรับผู้ที่ทันสมัยและใส่ใจเทรนด์แฟชั่น เปลี่ยนการค้นหาแฟชั่นให้กลายเป็นการเดินทางที่เต็มไปด้วยแรงบันดาลใจ
        </p>

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          <div className="p-6 bg-neutral-50 border border-neutral-200 hover:border-black transition-colors">
            <Award className="w-6 h-6 text-black mb-4" />
            <h3 className="font-bold text-sm text-black mb-2 uppercase">
              ไอคอนิกแบรนด์คอลเลกชัน
            </h3>
            <p className="font-kanit text-xs text-neutral-600 font-light leading-relaxed">
              รวบรวมแบรนด์ชั้นนำระดับโลก เช่น QUINN, MELISSA, MARITHÉ, REEF, DIESEL, PUMA และ SATUR ไว้ในที่เดียว
            </p>
          </div>

          <div className="p-6 bg-neutral-50 border border-neutral-200 hover:border-black transition-colors">
            <Sparkles className="w-6 h-6 text-black mb-4" />
            <h3 className="font-bold text-sm text-black mb-2 uppercase">
              ประสบการณ์ช้อปปิ้งยุคใหม่
            </h3>
            <p className="font-kanit text-xs text-neutral-600 font-light leading-relaxed">
              สัมผัสประสบการณ์ช้อปปิ้งดิจิทัลไร้รอยต่อ สะดวก รวดเร็ว พร้อมบริการผ่อนชำระ 0%* ทุกคำสั่งซื้อ
            </p>
          </div>

          <div className="p-6 bg-neutral-50 border border-neutral-200 hover:border-black transition-colors">
            <ShieldCheck className="w-6 h-6 text-black mb-4" />
            <h3 className="font-bold text-sm text-black mb-2 uppercase">
              การันตีสินค้าแท้ 100%
            </h3>
            <p className="font-kanit text-xs text-neutral-600 font-light leading-relaxed">
              จัดจำหน่ายโดย TukShop Group ผู้นำในธุรกิจแฟชั่นและไลฟ์สไตล์ของประเทศไทย
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
