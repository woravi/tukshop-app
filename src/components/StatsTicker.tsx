"use client";

import { motion } from "framer-motion";
import { Zap, Store, CreditCard, ShieldAlert, Award, ArrowUpRight } from "lucide-react";

export default function StatsTicker() {
  const stats = [
    { label: "ร้านค้าที่ไว้วางใจ", value: "12,500+", icon: Store, color: "#CCFF00" },
    { label: "มูลค่าการซื้อขายปีนี้", value: "฿1.2 พันล้าน", icon: CreditCard, color: "#A855F7" },
    { label: "เวลาประมวลผลต่อบิล", value: "< 0.2 วินาที", icon: Zap, color: "#FF5722" },
    { label: "อัตราความเสถียรรอบปี", value: "99.99%", icon: Award, color: "#00F0FF" },
  ];

  return (
    <section className="py-10 bg-black border-y-4 border-[#CCFF00] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0A0A0A] border-2 border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:border-[#CCFF00] transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[4px_4px_0px_0px_#CCFF00]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-black font-bold"
                    style={{ backgroundColor: item.color, color: "#0A0A0A" }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                    Realtime Metrics
                  </span>
                </div>
                <div className="font-prompt font-black text-3xl sm:text-4xl text-white tracking-tight mb-1">
                  {item.value}
                </div>
                <div className="font-kanit text-xs text-gray-400 font-light">
                  {item.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Neo-Brutalist Endless Ticker Marquee */}
      <div className="bg-[#CCFF00] text-black font-prompt font-black text-xl py-3 border-t-2 border-b-2 border-black tracking-wider uppercase whitespace-nowrap overflow-hidden flex select-none">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12 shrink-0"
        >
          <span>🚀 TUKSHOP NEO COMMERCE PLATFORM</span>
          <span>✦</span>
          <span>⚡ HIGHEST SPEED POS IN THAILAND</span>
          <span>✦</span>
          <span>🔥 AI POWERED SALES COPILOT</span>
          <span>✦</span>
          <span>💎 ZERO SETUP FEES & EASY MIGRATION</span>
          <span>✦</span>
          <span>🚀 TUKSHOP NEO COMMERCE PLATFORM</span>
          <span>✦</span>
          <span>⚡ HIGHEST SPEED POS IN THAILAND</span>
          <span>✦</span>
        </motion.div>
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12 shrink-0"
        >
          <span>🚀 TUKSHOP NEO COMMERCE PLATFORM</span>
          <span>✦</span>
          <span>⚡ HIGHEST SPEED POS IN THAILAND</span>
          <span>✦</span>
          <span>🔥 AI POWERED SALES COPILOT</span>
          <span>✦</span>
          <span>💎 ZERO SETUP FEES & EASY MIGRATION</span>
          <span>✦</span>
          <span>🚀 TUKSHOP NEO COMMERCE PLATFORM</span>
          <span>✦</span>
          <span>⚡ HIGHEST SPEED POS IN THAILAND</span>
          <span>✦</span>
        </motion.div>
      </div>
    </section>
  );
}
