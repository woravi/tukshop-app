"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, TrendingUp, Sparkles, Rocket, Star, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  // Text Reveal Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  return (
    <section id="hero" className="relative min-h-screen pt-32 pb-20 px-4 sm:px-8 overflow-hidden bg-neo-grid">
      {/* Background Neon Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#A855F7]/20 via-[#CCFF00]/10 to-[#FF5722]/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#CCFF00]/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Top Tagline Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black border-2 border-[#CCFF00] rounded-full shadow-[4px_4px_0px_0px_#A855F7]">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#CCFF00] animate-ping" />
            <span className="font-prompt text-xs font-bold text-[#CCFF00] tracking-wider uppercase">
              ⚡ NEXT-GEN COMMERCE PLATFORM FOR THAILAND
            </span>
          </div>
        </motion.div>

        {/* Hero Headline - Giant Neo-Brutalist Typography */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-5xl mx-auto mb-12"
        >
          <motion.h1
            variants={itemVariants}
            className="font-prompt font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[1.05] mb-6"
          >
            ขับเคลื่อนธุรกิจด้วย{" "}
            <span className="text-gradient-lime-purple inline-block underline decoration-[#CCFF00] decoration-wavy decoration-2">
              TUKSHOP
            </span>{" "}
            <br />
            เร็ว แรง ทรงพลัง <span className="bg-[#A855F7] text-white px-3 py-1 rounded-2xl border-4 border-black inline-block rotate-1 shadow-[5px_5px_0px_0px_#CCFF00]">ไร้ขีดจำกัด</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="font-kanit text-lg sm:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed"
          >
            ระบบ POS และร้านค้าออนไลน์สไตล์ <strong className="text-[#CCFF00] font-semibold">Neo-Brutalism</strong> ปรับเปลี่ยนได้ดั่งใจ 
            เชื่อมต่อสต็อก ชำระเงินรวดเร็ว และ AI ช่วยขาย ยอดขายพุ่งกระฉูด 300%
          </motion.p>
        </motion.div>

        {/* CTA Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16"
        >
          <a
            href="#cta"
            className="glow-button-lime px-9 py-4 rounded-2xl text-lg font-prompt font-bold flex items-center gap-3 w-full sm:w-auto justify-center group"
          >
            <Rocket className="w-6 h-6 text-black group-hover:translate-x-1 transition-transform" />
            <span>เริ่มต้นสร้างร้านฟรี 14 วัน</span>
            <ArrowRight className="w-5 h-5 text-black" />
          </a>

          <a
            href="#portfolio"
            className="glow-button-purple px-8 py-4 rounded-2xl text-lg font-prompt font-bold flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>รับชมตัวอย่างระบบจริง</span>
          </a>
        </motion.div>

        {/* Bento Grid Hero Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
          
          {/* Main Showcase Bento Card (Large) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="md:col-span-8 glass-neo-card p-6 sm:p-8 rounded-3xl border-2 border-[#CCFF00]/40 relative overflow-hidden group hover:border-[#CCFF00] transition-all shadow-[8px_8px_0px_0px_#A855F7]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5722]" />
                <span className="w-3 h-3 rounded-full bg-[#CCFF00]" />
                <span className="w-3 h-3 rounded-full bg-[#A855F7]" />
                <span className="text-xs font-mono text-gray-400 ml-2">TukShop POS v2.5 Terminal Live</span>
              </div>
              <span className="text-xs bg-[#CCFF00] text-black font-bold px-3 py-1 rounded-full uppercase">
                Active System
              </span>
            </div>

            {/* Dashboard Preview Image */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <Image
                src="/images/tukshop_pos.jpg"
                alt="TukShop POS Terminal Interface"
                width={1200}
                height={675}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#CCFF00] rounded-lg flex items-center justify-center text-black font-bold font-mono">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-prompt font-bold text-white text-sm">ระบบคิดเงินความเร็วแสง (0.2s)</h4>
                    <p className="text-xs text-gray-300">รองรับ QR PromptPay, บัตรเครดิต, และตัดสต็อกอัตโนมัติ</p>
                  </div>
                </div>
                <span className="hidden sm:inline-block font-mono text-xs font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1.5 rounded-lg border border-[#CCFF00]/30">
                  99.99% Uptime
                </span>
              </div>
            </div>
          </motion.div>

          {/* Side Bento Cards & Floating Elements */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* Bento Card 2: Sales Speed */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="glass-neo-card p-6 rounded-3xl border-2 border-[#A855F7]/40 shadow-[6px_6px_0px_0px_#CCFF00] relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#A855F7] text-white rounded-2xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#CCFF00]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-3xl font-prompt font-black text-[#CCFF00]">+340%</span>
              </div>
              <h3 className="font-prompt font-bold text-xl text-white mb-2">อัตราการเติบโตยอดขาย</h3>
              <p className="text-sm text-gray-300 font-kanit font-light">
                ร้านค้าที่เปลี่ยนมาใช้ TukShop มียอดขายเติบโตเฉลี่ย 3.4 เท่าภายใน 60 วันแรก
              </p>
            </motion.div>

            {/* Bento Card 3: AI Smart Assistant */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="glass-neo-card p-6 rounded-3xl border-2 border-[#FF5722]/40 shadow-[6px_6px_0px_0px_#A855F7] relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#FF5722] text-white rounded-2xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#CCFF00]">
                  <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div>
                  <h4 className="font-prompt font-bold text-lg text-white">AI Commerce Copilot</h4>
                  <span className="text-xs text-[#CCFF00] font-mono">วิเคราะห์พฤติกรรมลูกค้าอัตโนมัติ</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs font-kanit text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
                  <span>แจ้งเตือนสินค้าขายดีก่อนสต็อกหมด</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
                  <span>สร้างแคมเปญการตลาดอัตโนมัติด้วย AI</span>
                </li>
              </ul>
            </motion.div>

          </div>
        </div>

        {/* Floating Animated Badges (Framer Motion Float) */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="hidden lg:flex absolute top-44 left-8 bg-black border-2 border-[#CCFF00] p-4 rounded-2xl shadow-[6px_6px_0px_0px_#A855F7] items-center gap-3 pointer-events-none"
        >
          <div className="w-10 h-10 bg-[#CCFF00] rounded-xl flex items-center justify-center font-bold text-black font-mono text-xl">
            ⚡
          </div>
          <div>
            <p className="text-xs text-gray-400 font-mono">⚡ Ultra Speed</p>
            <p className="font-prompt font-bold text-sm text-white">โหลดเร็ว 0.05 วินาที</p>
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [2, -2, 2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="hidden lg:flex absolute top-56 right-8 bg-black border-2 border-[#A855F7] p-4 rounded-2xl shadow-[6px_6px_0px_0px_#FF5722] items-center gap-3 pointer-events-none"
        >
          <div className="w-10 h-10 bg-[#A855F7] rounded-xl flex items-center justify-center font-bold text-white font-mono text-xl">
            🔒
          </div>
          <div>
            <p className="text-xs text-gray-400 font-mono">🛡️ Enterprise Grade</p>
            <p className="font-prompt font-bold text-sm text-white">ระบบความปลอดภัยสูง</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
