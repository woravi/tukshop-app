"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Sparkles, Check, Copy } from "lucide-react";
import confetti from "canvas-confetti";

export default function PricingSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#000000", "#555555", "#888888"],
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const promos = [
    {
      code: "WELCOME10",
      discount: "ส่วนลด 10%",
      title: "โค้ดต้อนรับสมาชิกใหม่",
      subtitle: "ลด 10% สำหรับคำสั่งซื้อแรก ไม่มีขั้นต่ำ",
      conditions: ["สำหรับสมาชิกที่ลงทะเบียนใหม่", "ใช้ได้กับสินค้าทุกหมวดหมู่", "1 สิทธิ์ / 1 บัญชี"],
      badge: "NEW MEMBER"
    },
    {
      code: "JPSCLUB10",
      discount: "ส่วนลดสูงสุด 10%",
      title: "สิทธิพิเศษ JPS CLUB",
      subtitle: "เพียงแจ้งอีเมลและเบอร์โทรที่ลงทะเบียน",
      conditions: ["สำหรับสมาชิก JPS CLUB เท่านั้น", "ใช้ได้กับสินค้าราคาปกติ", "สะสมคะแนนได้ตามปกติ"],
      badge: "EXCLUSIVE"
    },
    {
      code: "FLEXPAY0",
      discount: "ผ่อนชำระ 0%*",
      title: "ช้อปก่อน จ่ายทีหลัง 0%",
      subtitle: "ผ่อนชำระสบายๆ สูงสุด 10 เดือน",
      conditions: ["รองรับบัตรเครดิตที่ร่วมรายการ", "รองรับ SPayLater & ShopeePay", "เมื่อช้อปครบ 3,000 บาทขึ้นไป"],
      badge: "POPULAR"
    },
  ];

  return (
    <section id="pricing" className="py-16 px-4 sm:px-8 bg-neutral-50 border-b border-neutral-200 font-prompt">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-400 block mb-1">
            ONLINE PROMOTIONS & VOUCHERS
          </span>
          <h2 className="font-prompt font-black text-2xl sm:text-3xl text-black uppercase">
            โปรโมชั่นออนไลน์ & โค้ดส่วนลด
          </h2>
          <p className="font-kanit text-xs text-neutral-500 font-light mt-1">
            กดรับโค้ดส่วนลดเพื่อนำไปใช้ในหน้าชำระเงิน
          </p>
        </div>

        {/* Promo Voucher Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promos.map((promo, idx) => (
            <div
              key={idx}
              className="bg-white border border-neutral-200 p-6 flex flex-col justify-between hover:border-black transition-all duration-300 relative shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-black text-white px-2.5 py-0.5">
                    {promo.badge}
                  </span>
                  <Tag className="w-4 h-4 text-black" />
                </div>

                <span className="text-2xl font-black text-black font-prompt block mb-1">
                  {promo.discount}
                </span>
                <h3 className="font-bold text-sm text-black mb-1 uppercase">
                  {promo.title}
                </h3>
                <p className="font-kanit text-xs text-neutral-500 font-light mb-4">
                  {promo.subtitle}
                </p>

                <ul className="space-y-2 mb-6 border-t border-neutral-100 pt-4 font-kanit text-xs text-neutral-600">
                  {promo.conditions.map((cond, cIdx) => (
                    <li key={cIdx} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-black stroke-[3]" />
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code Box & Copy Action */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50 p-3">
                <div>
                  <span className="text-[9px] text-neutral-400 font-mono block">PROMO CODE</span>
                  <span className="font-mono font-bold text-xs text-black tracking-widest">{promo.code}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(promo.code)}
                  className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-neutral-800 transition-colors flex items-center gap-1"
                >
                  {copiedCode === promo.code ? (
                    <span>คัดลอกแล้ว!</span>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>คัดลอก</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
