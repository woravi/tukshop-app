"use client";

import { useState } from "react";
import { ArrowRight, Send, Check } from "lucide-react";
import confetti from "canvas-confetti";

export default function CtaFooter() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
      colors: ["#000000", "#555555", "#888888"],
    });
  };

  return (
    <footer className="bg-white text-black font-prompt border-t border-neutral-200">
      
      {/* 1. studiofour Newsletter Banner Section */}
      <div className="bg-black text-white py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-400 block mb-2">
            TUKSHOP NEWSLETTER
          </span>
          <h3 className="font-prompt font-black text-2xl sm:text-4xl uppercase tracking-tight mb-4">
            รับส่วนลด 10% สำหรับออเดอร์แรกของคุณ*
          </h3>
          <p className="font-kanit text-xs sm:text-sm text-neutral-400 font-light max-w-xl mx-auto mb-8">
            ลงทะเบียนสมัครสมาชิกเพื่อรับข่าวสารสินค้าใหม่ คอลเลกชันพิเศษ และสิทธิโปรโมชั่นออนไลน์ก่อนใคร
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="กรอกอีเมลของคุณที่นี่..."
                required
                className="bg-white/10 border border-white/30 text-white placeholder-neutral-400 text-xs px-4 py-3 font-kanit focus:outline-none focus:border-white flex-1"
              />
              <button
                type="submit"
                className="bg-white text-black text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-neutral-200 transition-colors shrink-0"
              >
                ลงทะเบียนเลย
              </button>
            </form>
          ) : (
            <div className="p-4 bg-white/10 border border-white/30 text-white font-kanit text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
              <Check className="w-4 h-4 text-green-400" />
              <span>ลงทะเบียนสำเร็จ! รับโค้ดส่วนลด 10% ในอีเมลเรียบร้อยแล้ว</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Studiofour Multi-Column Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-200">
          
          {/* Brand Info */}
          <div>
            <a href="#" className="inline-block font-prompt font-black text-2xl tracking-tighter text-black uppercase mb-4">
              Tuk<span className="font-light tracking-widest text-neutral-800">Shop</span> <span className="text-xs font-mono font-normal text-neutral-400">TH</span>
            </a>
            <p className="font-kanit text-neutral-600 text-xs font-light leading-relaxed max-w-xs mb-6">
              TukShop คือ ห้องเสื้อดิจิทัลที่รวมแบรนด์ไอคอนิกเข้าด้วยกัน ออกแบบมาสำหรับผู้ที่ทันสมัยและใส่ใจเทรนด์แฟชั่น
            </p>
            <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-widest block">
              POWERED BY TUKSHOP GROUP
            </span>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-prompt font-bold text-xs uppercase tracking-widest text-black mb-4">
              CUSTOMER SERVICE
            </h4>
            <ul className="space-y-2 font-kanit text-xs text-neutral-600 font-light">
              <li><a href="#about" className="hover:text-black transition-colors">คำถามที่พบบ่อย (FAQ)</a></li>
              <li><a href="#about" className="hover:text-black transition-colors">ร้านของเรา (Store Location)</a></li>
              <li><a href="#about" className="hover:text-black transition-colors">ติดต่อเรา (Contact Us)</a></li>
              <li><a href="#perks" className="hover:text-black transition-colors">การจัดส่งและการคืนสินค้า</a></li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h4 className="font-prompt font-bold text-xs uppercase tracking-widest text-black mb-4">
              เกี่ยวกับเรา
            </h4>
            <ul className="space-y-2 font-kanit text-xs text-neutral-600 font-light">
              <li><a href="#about" className="hover:text-black transition-colors">เกี่ยวกับ TukShop</a></li>
              <li><a href="#about" className="hover:text-black transition-colors">TukShop Group (ต๊อกช็อป กรุ๊ป)</a></li>
              <li><a href="#perks" className="hover:text-black transition-colors">สิทธิพิเศษสมาชิก JPS CLUB</a></li>
              <li><a href="#pricing" className="hover:text-black transition-colors">โปรโมชั่นออนไลน์ทั้งหมด</a></li>
            </ul>
          </div>

          {/* Iconic Brands Links */}
          <div>
            <h4 className="font-prompt font-bold text-xs uppercase tracking-widest text-black mb-4">
              ICONIC BRANDS
            </h4>
            <div className="flex flex-wrap gap-2 font-kanit text-[11px] text-neutral-600 font-normal">
              {["QUINN", "MELISSA", "REEF", "IPANEMA", "MARITHÉ", "HOLSTER", "DIESEL", "PUMA", "SATUR"].map((b, i) => (
                <a key={i} href="#brands" className="bg-neutral-100 px-2 py-1 hover:bg-black hover:text-white transition-colors">
                  {b}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* 3. Bottom Copyright & Payment Method Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-kanit text-xs text-neutral-500 font-light">
          <p>© {new Date().getFullYear()} TUKSHOP CO., LTD. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            <span>VISA</span>
            <span>MASTERCARD</span>
            <span>PROMPTPAY</span>
            <span>SPAYLATER</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
