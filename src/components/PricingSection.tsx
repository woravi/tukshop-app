"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Shield, Crown } from "lucide-react";
import confetti from "canvas-confetti";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const handleSelectPlan = (planName: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#CCFF00", "#A855F7", "#FF5722"],
    });
  };

  const plans = [
    {
      name: "STARTER TUK",
      icon: Zap,
      accent: "#FFFFFF",
      priceMonthly: "990",
      priceAnnual: "790",
      description: "เหมาะสำหรับร้านค้าเริ่มต้น และ SME ขนาดเล็ก",
      features: [
        "1 เครื่อง POS สำหรับหน้าร้าน",
        "รองรับการขาย 3,000 รายการ/เดือน",
        "พิมพ์ใบเสร็จ & รับชำระ QR Code",
        "การจัดการสต็อกสินค้าพื้นฐาน",
        "สนับสนุนลูกค้าผ่าน Line OA 24/7",
      ],
      ctaText: "เลือกแพ็กเกจ Starter",
      popular: false,
    },
    {
      name: "PRO TUKSHOP",
      icon: Sparkles,
      accent: "#CCFF00",
      priceMonthly: "2,490",
      priceAnnual: "1,990",
      description: "แพ็กเกจยอดนิยมสำหรับร้านค้าที่มียอดขายเติบโตสูง",
      features: [
        "3 เครื่อง POS + ระบบ Mobile App",
        "ไม่จำกัดจำนวนรายการขายต่อเดือน",
        "เชื่อมต่อ Lazada, Shopee & TikTok Shop",
        "AI วิเคราะห์สินค้าขายดี & สต็อกอัตโนมัติ",
        "ระบบสะสมแต้มสมาชิก & คูปองส่วนลด",
        "สิทธิ์เข้าใช้งาน API ปรับแต่งได้เต็มรูปแบบ",
      ],
      ctaText: "ทดลองใช้งานฟรี 14 วัน",
      popular: true,
    },
    {
      name: "ENTERPRISE TUK",
      icon: Crown,
      accent: "#A855F7",
      priceMonthly: "5,990",
      priceAnnual: "4,790",
      description: "สำหรับแบรนด์ใหญ่ และร้านค้าหลายสาขา (Multi-Branch)",
      features: [
        "ไม่จำกัดจำนวนเครื่อง POS & สาขา",
        "ระบบบริหารคลังสินค้าส่วนกลาง (Central Hub)",
        "Dedicated Account Manager ดูแลส่วนตัว",
        "Custom ERP/CRM Integration",
        "SLA ความเสถียร 99.99% พร้อมทีมดูแลถึงที่",
      ],
      ctaText: "ติดต่อฝ่ายขายองค์กร",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-28 px-4 sm:px-8 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#CCFF00]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black border border-[#FF5722] rounded-full shadow-[3px_3px_0px_0px_#CCFF00] mb-4">
            <Zap className="w-4 h-4 text-[#FF5722]" />
            <span className="font-prompt text-xs font-bold text-white tracking-widest uppercase">
              TRANSPARENT PRICING
            </span>
          </div>
          <h2 className="font-prompt font-black text-4xl sm:text-6xl text-white tracking-tight mb-6">
            แพ็กเกจคุ้มค่า <br />
            <span className="text-gradient-lime-purple">ไม่มีค่าธรรมเนียมแอบแฝง</span>
          </h2>
          <p className="font-kanit text-gray-300 text-lg font-light mb-8">
            เลือกแพ็กเกจที่เหมาะกับขนาดธุรกิจของคุณ และยกระดับร้านค้าวันนี้
          </p>

          {/* Toggle Monthly / Annual */}
          <div className="inline-flex items-center gap-3 bg-black p-2 rounded-2xl border-2 border-white/20 shadow-[4px_4px_0px_0px_#A855F7]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2.5 rounded-xl font-prompt text-sm font-bold transition-all ${
                !isAnnual ? "bg-white text-black shadow-[2px_2px_0px_0px_#CCFF00]" : "text-gray-400 hover:text-white"
              }`}
            >
              ชำระรายเดือน
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2.5 rounded-xl font-prompt text-sm font-bold transition-all flex items-center gap-2 ${
                isAnnual ? "bg-[#CCFF00] text-black shadow-[2px_2px_0px_0px_#A855F7]" : "text-gray-400 hover:text-white"
              }`}
            >
              <span>ชำระรายปี</span>
              <span className="bg-[#FF5722] text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
                ประหยัด 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className={`glass-neo-card p-8 rounded-3xl relative flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "border-4 border-[#CCFF00] shadow-[10px_10px_0px_0px_#A855F7] lg:-translate-y-4"
                    : "border-2 border-white/20 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:border-white/50"
                }`}
              >
                {/* Popular Pill */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#CCFF00] text-black font-prompt font-black text-xs uppercase px-4 py-1.5 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_#A855F7] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 fill-black" />
                    MOST POPULAR CHOICE
                  </div>
                )}

                <div>
                  {/* Plan Name & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-prompt font-black text-2xl text-white tracking-tight">
                      {plan.name}
                    </h3>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-black font-bold"
                      style={{ backgroundColor: plan.accent, color: "#0A0A0A" }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="font-kanit text-xs text-gray-300 font-light mb-6 min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Price Display */}
                  <div className="mb-8 p-4 bg-black/60 rounded-2xl border border-white/10 flex items-baseline gap-1">
                    <span className="font-prompt font-black text-4xl sm:text-5xl text-white">
                      ฿{isAnnual ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    <span className="font-kanit text-xs text-gray-400 font-light">
                      / เดือน {isAnnual ? "(ชำระรายปี)" : ""}
                    </span>
                  </div>

                  {/* Feature Check List */}
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 font-kanit text-sm text-gray-200">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: `${plan.accent}30`, color: plan.accent }}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action CTA */}
                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full py-4 rounded-2xl font-prompt font-bold text-base transition-all ${
                    plan.popular
                      ? "glow-button-lime"
                      : "glow-button-purple"
                  }`}
                >
                  {plan.ctaText}
                </button>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
