"use client";

import { motion } from "framer-motion";
import { Rocket, Sparkles, ShoppingBag, ArrowUpRight, Heart, Send, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function CtaFooter() {
  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7 },
      colors: ["#CCFF00", "#A855F7", "#FF5722", "#00F0FF"],
    });
  };

  return (
    <footer id="cta" className="relative pt-24 pb-12 bg-black border-t-4 border-[#CCFF00] overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-[#A855F7]/25 via-[#CCFF00]/15 to-[#FF5722]/25 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative">
        
        {/* Giant High-Impact CTA Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-neo-card p-10 sm:p-16 rounded-3xl border-4 border-[#CCFF00] shadow-[12px_12px_0px_0px_#A855F7] text-center mb-24 relative overflow-hidden group"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black border border-[#CCFF00] rounded-full shadow-[3px_3px_0px_0px_#FF5722] mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-ping" />
            <span className="font-prompt text-xs font-bold text-[#CCFF00] tracking-wider uppercase">
              READY TO UPGRADE YOUR STORE?
            </span>
          </div>

          <h2 className="font-prompt font-black text-4xl sm:text-7xl text-white tracking-tight leading-tight mb-6">
            พร้อมเปลี่ยนร้านค้าของคุณสู่ <br />
            <span className="text-gradient-lime-purple">TUKSHOP NEO COMMERCE?</span>
          </h2>

          <p className="font-kanit text-gray-300 text-lg sm:text-2xl font-light max-w-3xl mx-auto mb-10">
            เริ่มต้นใช้งานระบบทดลองฟรี 14 วันเต็ม โดยไม่ต้องกรอกบัตรเครดิต เซ็ตระบบเสร็จพร้อมใช้งานภายใน 5 นาที
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button
              onClick={triggerConfetti}
              className="glow-button-lime px-10 py-5 rounded-2xl text-xl font-prompt font-bold flex items-center gap-3 w-full sm:w-auto justify-center group"
            >
              <Rocket className="w-7 h-7 text-black group-hover:rotate-12 transition-transform" />
              <span>เริ่มสร้างร้านค้าของคุณเลย</span>
              <ArrowUpRight className="w-6 h-6 text-black" />
            </button>

            <a
              href="#pricing"
              className="glow-button-purple px-9 py-5 rounded-2xl text-xl font-prompt font-bold flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              <span>ปรึกษาทีมงานฟรี</span>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-kanit text-gray-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" /> ไม่ต้องใช้บัตรเครดิต
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" /> ยกเลิกได้ทุกเมื่อ
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" /> ทีมงานดูแล 24/7
            </span>
          </div>
        </motion.div>

        {/* Footer Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="md:col-span-2">
            <a href="#hero" className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-11 h-11 bg-[#CCFF00] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#A855F7]">
                <ShoppingBag className="w-6 h-6 text-black" />
              </div>
              <span className="font-prompt font-black text-3xl tracking-tighter text-white">
                TUK<span className="text-[#CCFF00]">SHOP</span>
              </span>
            </a>
            <p className="font-kanit text-gray-400 text-sm font-light leading-relaxed max-w-sm mb-6">
              ระบบ POS และร้านค้าออนไลน์สไตล์ Neo-Brutalism พลังแรงสูงสุดในประเทศไทย ออกแบบด้วยมาตรฐานระดับเอเจนซี่โลก
            </p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#CCFF00] animate-pulse" />
              <span className="text-xs font-mono text-[#CCFF00] font-bold">
                SYSTEM STATUS: ALL SYSTEMS OPERATIONAL (99.99%)
              </span>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="font-prompt font-bold text-white text-base mb-4 uppercase tracking-wider">
              ผลิตภัณฑ์
            </h4>
            <ul className="space-y-2.5 font-kanit text-sm text-gray-400">
              <li><a href="#features" className="hover:text-[#CCFF00] transition-colors">TukShop POS Terminal</a></li>
              <li><a href="#features" className="hover:text-[#CCFF00] transition-colors">E-Commerce Storefront</a></li>
              <li><a href="#features" className="hover:text-[#CCFF00] transition-colors">Mobile Delivery App</a></li>
              <li><a href="#features" className="hover:text-[#CCFF00] transition-colors">AI Sales Analytics</a></li>
              <li><a href="#features" className="hover:text-[#CCFF00] transition-colors">Inventory Manager</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="font-prompt font-bold text-white text-base mb-4 uppercase tracking-wider">
              บริษัท & ช่วยเหลือ
            </h4>
            <ul className="space-y-2.5 font-kanit text-sm text-gray-400">
              <li><a href="#testimonials" className="hover:text-[#CCFF00] transition-colors">เกี่ยวกับ TukShop</a></li>
              <li><a href="#testimonials" className="hover:text-[#CCFF00] transition-colors">รีวิวลูกค้า</a></li>
              <li><a href="#pricing" className="hover:text-[#CCFF00] transition-colors">คำถามที่พบบ่อย (FAQ)</a></li>
              <li><a href="#cta" className="hover:text-[#CCFF00] transition-colors">ติดต่อฝ่ายซัพพอร์ต</a></li>
              <li><a href="#cta" className="hover:text-[#CCFF00] transition-colors">นโยบายความเป็นส่วนตัว</a></li>
            </ul>
          </div>

          {/* Newsletter / Social */}
          <div>
            <h4 className="font-prompt font-bold text-white text-base mb-4 uppercase tracking-wider">
              ติดตามเรา
            </h4>
            <p className="font-kanit text-xs text-gray-400 mb-4">
              รับอัปเดตฟีเจอร์และเทรนด์การค้าขายล่าสุดก่อนใคร
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="อีเมลของคุณ..."
                className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00] font-kanit w-full"
              />
              <button className="bg-[#CCFF00] text-black font-bold p-2.5 rounded-xl border border-black shadow-[2px_2px_0px_0px_#A855F7] hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-kanit text-xs text-gray-500">
          <p>© {new Date().getFullYear()} TUKSHOP CO., LTD. ALL RIGHTS RESERVED.</p>
          <p className="flex items-center gap-1">
            CRAFTED WITH <Heart className="w-3.5 h-3.5 text-[#FF5722] fill-[#FF5722]" /> IN BANGKOK, THAILAND
          </p>
        </div>

      </div>
    </footer>
  );
}
