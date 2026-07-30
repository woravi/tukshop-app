"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  Smartphone, 
  Bot, 
  BarChart3, 
  Globe2, 
  ShieldCheck, 
  Layers, 
  QrCode, 
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      accent: "#CCFF00",
      accentBg: "rgba(204, 255, 0, 0.15)",
      title: "ระบบ POS คิดเงินความเร็วแสง",
      description: "คิดเงินและสแกนบาร์โค้ดใน 0.2 วินาที ออกใบกำกับภาษีเต็มรูปแบบอัตโนมัติ ไม่ต้องรอนาน",
      badge: "ULTRA FAST POS",
    },
    {
      icon: Globe2,
      accent: "#A855F7",
      accentBg: "rgba(168, 85, 247, 0.15)",
      title: "ร้านค้าออนไลน์ Omnichannel",
      description: "เชื่อมต่อสต็อกหน้าร้านและออนไลน์ (Lazada, Shopee, TikTok Shop) ตัดสต็อกพร้อมกันเรียลไทม์",
      badge: "REALTIME SYNC",
    },
    {
      icon: Bot,
      accent: "#FF5722",
      accentBg: "rgba(255, 87, 34, 0.15)",
      title: "AI Smart Sales Advisor",
      description: "ระบบ AI วิเคราะห์สินค้าขายดี แนะนำโปรโมชันเฉพาะบุคคล และทำนายความต้องการล่วงหน้า",
      badge: "AI DRIVEN",
    },
    {
      icon: QrCode,
      accent: "#00F0FF",
      accentBg: "rgba(0, 240, 255, 0.15)",
      title: "รองรับการชำระเงินทุกรูปแบบ",
      description: "QR PromptPay ทุกธนาคาร, บัตรเครดิต, Apple Pay, และระบบผ่อนชำระแบบไม่มีสะดุด",
      badge: "SMART PAYMENT",
    },
    {
      icon: BarChart3,
      accent: "#CCFF00",
      accentBg: "rgba(204, 255, 0, 0.15)",
      title: "แดชบอร์ดการเงิน & Analytics",
      description: "ดูรายงานยอดขาย กำไร ขาดทุน และพฤติกรรมลูกค้าได้แบบ Live Stream จากมือถือทุกที่ทั่วโลก",
      badge: "LIVE TELEMETRY",
    },
    {
      icon: ShieldCheck,
      accent: "#A855F7",
      accentBg: "rgba(168, 85, 247, 0.15)",
      title: "ความปลอดภัยระดับธนาคาร",
      description: "สำรองข้อมูลแบบไร้ขีดจำกัดบน Cloud พร้อมระบบเข้ารหัส End-to-End ป้องกันข้อมูลรั่วไหล 100%",
      badge: "ENTERPRISE SECURE",
    },
  ];

  // Staggered Container Animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  // Card Reveal Animation
  const cardVariants = {
    hidden: { y: 60, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 14,
      },
    },
  };

  return (
    <section id="features" className="py-28 px-4 sm:px-8 relative overflow-hidden bg-[#0A0A0A]">
      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#CCFF00]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#A855F7]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black border border-[#A855F7] rounded-full shadow-[3px_3px_0px_0px_#CCFF00] mb-4">
            <Sparkles className="w-4 h-4 text-[#A855F7]" />
            <span className="font-prompt text-xs font-bold text-white tracking-widest uppercase">
              NEXT-LEVEL FEATURES
            </span>
          </div>
          <h2 className="font-prompt font-black text-4xl sm:text-6xl text-white tracking-tight mb-6">
            ทุกฟีเจอร์ที่ธุรกิจต้องการ <br />
            <span className="text-gradient-lime-purple">รวมไว้ใน TukShop หนึ่งเดียว</span>
          </h2>
          <p className="font-kanit text-gray-300 text-lg sm:text-xl font-light">
            ดีไซน์กระจกใสทรงเสน่ห์ ผสมความแกร่งแบบ Neo-Brutalism เพื่อการทำงานที่ไม่เคยสะดุด
          </p>
        </div>

        {/* Staggered Glassmorphism Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="glass-neo-card p-8 rounded-3xl relative overflow-hidden group hover:border-2 transition-all duration-300 flex flex-col justify-between"
                style={{
                  borderColor: `${feature.accent}40`,
                  boxShadow: `6px 6px 0px 0px ${feature.accent}`,
                }}
              >
                {/* Glow Backdrop Hover Effect */}
                <div 
                  className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: feature.accent }}
                />

                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#0A0A0A] group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: feature.accent, color: "#0A0A0A" }}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span 
                      className="text-[10px] font-mono font-bold px-3 py-1 rounded-lg border uppercase tracking-wider"
                      style={{
                        backgroundColor: feature.accentBg,
                        color: feature.accent,
                        borderColor: `${feature.accent}50`,
                      }}
                    >
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-prompt font-bold text-2xl text-white mb-3 group-hover:text-[#CCFF00] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="font-kanit text-gray-300 text-sm font-light leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-prompt text-gray-400 font-medium group-hover:text-white transition-colors">
                    เรียนรู้เพิ่มเติม
                  </span>
                  <div 
                    className="w-8 h-8 rounded-full border flex items-center justify-center group-hover:translate-x-1 transition-transform"
                    style={{ borderColor: `${feature.accent}60`, color: feature.accent }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
