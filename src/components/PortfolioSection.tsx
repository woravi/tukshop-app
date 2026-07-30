"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Sparkles, Eye, CheckCircle2, ArrowRight } from "lucide-react";

export default function PortfolioSection() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<typeof portfolioItems[0] | null>(null);

  const portfolioItems = [
    {
      id: "pos-system",
      category: "pos",
      categoryLabel: "POS & หน้าร้าน",
      title: "TukShop Smart POS v2.5",
      subtitle: "ระบบคิดเงินความเร็วสูง และบริหารสต็อกหน้าร้าน",
      image: "/images/tukshop_pos.jpg",
      tags: ["POS System", "Realtime Inventory", "PromptPay QR"],
      stats: "0.2s Billing Speed",
      accent: "#CCFF00",
      description: "ระบบคิดเงินอัจฉริยะ ออกแบบมาเพื่อหน้าร้านยุคใหม่ ช่วยให้พนักงานคิดเงินได้เร็วขึ้น 3 เท่า รองรับการสแกน QR Payment และพิมพ์ใบเสร็จอัตโนมัติ"
    },
    {
      id: "express-app",
      category: "mobile",
      categoryLabel: "Mobile Delivery",
      title: "TukShop Express Application",
      subtitle: "แอปจัดส่งสินค้า และติดตามออเดอร์ในมือถือ",
      image: "/images/tukshop_mobile.jpg",
      tags: ["iOS & Android", "GPS Tracking", "Rider App"],
      stats: "15-Min Delivery",
      accent: "#A855F7",
      description: "แอปพลิเคชันเดลิเวอรีสำหรับร้านค้าและไรเดอร์ ติดตามพิกัดการจัดส่งแบบเรียลไทม์พร้อมการแจ้งเตือน Push Notifications ถึงมือลูกค้าทันที"
    },
    {
      id: "ai-analytics",
      category: "analytics",
      categoryLabel: "AI & Analytics",
      title: "TukShop AI Analytics Dashboard",
      subtitle: "ศูนย์บัญชาการข้อมูลและทำนายยอดขายด้วย AI",
      image: "/images/tukshop_analytics.jpg",
      tags: ["AI Forecast", "Live Revenue", "Customer Insights"],
      stats: "99.8% Prediction Accuracy",
      accent: "#FF5722",
      description: "แดชบอร์ดแดนสวรรค์ของผู้บริหาร แสดงผลยอดขายแบบ Live Telemetry พร้อมระบบแจ้งเตือนการสต็อกสินค้าและกลยุทธ์ตั้งราคาโดยอัตโนมัติ"
    },
    {
      id: "digital-store",
      category: "ecommerce",
      categoryLabel: "E-Commerce",
      title: "TukShop Neo-Streetwear Store",
      subtitle: "ร้านค้าออนไลน์สไตล์ Neo-Brutalism พรีเมียม",
      image: "/images/tukshop_store.jpg",
      tags: ["Next.js Storefront", "Cyberpunk Vibes", "Fast Checkout"],
      stats: "4.9★ Customer Rating",
      accent: "#00F0FF",
      description: "หน้าร้านค้าออนไลน์ที่สร้างความตื่นตาตื่นใจให้ลูกค้า มอบประสบการณ์สั่งซื้อไร้รอยต่อ รองรับทั้งสินค้า Physical และ Digital Downloads"
    },
  ];

  const filteredItems = activeTab === "all" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeTab);

  return (
    <section id="portfolio" className="py-28 px-4 sm:px-8 bg-neo-grid relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#A855F7]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black border border-[#CCFF00] rounded-full shadow-[3px_3px_0px_0px_#A855F7] mb-4">
              <Sparkles className="w-4 h-4 text-[#CCFF00]" />
              <span className="font-prompt text-xs font-bold text-white tracking-widest uppercase">
                PORTFOLIO & SYSTEM SHOWCASE
              </span>
            </div>
            <h2 className="font-prompt font-black text-4xl sm:text-6xl text-white tracking-tight">
              ตัวอย่างระบบและ <br />
              <span className="text-gradient-lime-purple">ผลงานจริงจาก TukShop</span>
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-black/60 p-2 rounded-2xl border border-white/10">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "pos", label: "POS หน้าร้าน" },
              { id: "mobile", label: "Mobile App" },
              { id: "analytics", label: "AI Analytics" },
              { id: "ecommerce", label: "E-Commerce" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-prompt font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#CCFF00] text-black shadow-[3px_3px_0px_0px_#A855F7]"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Showcase Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="glass-neo-card rounded-3xl overflow-hidden border-2 border-white/10 hover:border-[#CCFF00] transition-all group shadow-[8px_8px_0px_0px_rgba(255,255,255,0.08)] hover:shadow-[8px_8px_0px_0px_#A855F7]"
              >
                {/* Image Container with Hover Zoom & Color Shift */}
                <div className="relative aspect-[16/9] overflow-hidden bg-black cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 filter group-hover:contrast-125 group-hover:brightness-110"
                  />
                  
                  {/* Neon Color Shift Overlay on Hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
                    style={{ backgroundColor: item.accent }}
                  />

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 left-4">
                    <span 
                      className="text-xs font-prompt font-bold px-3 py-1.5 rounded-xl border border-black shadow-[3px_3px_0px_0px_#0A0A0A]"
                      style={{ backgroundColor: item.accent, color: "#0A0A0A" }}
                    >
                      {item.stats}
                    </span>
                  </div>

                  {/* Quick View Hover Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-xs">
                    <button className="glow-button-lime px-6 py-3 rounded-2xl font-prompt font-bold flex items-center gap-2">
                      <Eye className="w-5 h-5 text-black" />
                      <span>ดูรายละเอียดระบบ</span>
                    </button>
                  </div>
                </div>

                {/* Card Content Info */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[11px] font-mono bg-white/5 text-gray-300 border border-white/10 px-2.5 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-prompt font-bold text-2xl text-white mb-2 group-hover:text-[#CCFF00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-kanit text-gray-300 text-sm font-light mb-6">
                    {item.subtitle}
                  </p>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400">STATUS: PRODUCTION READY</span>
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="text-sm font-prompt font-bold text-[#CCFF00] hover:underline flex items-center gap-1"
                    >
                      <span>เปิดดูแบบขยาย</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Modal Overlay for Item Details */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0A0A0A] border-4 border-[#CCFF00] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-[12px_12px_0px_0px_#A855F7] overflow-hidden cursor-default relative"
              >
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-6 border-2 border-white/20">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-[#CCFF00] text-black font-prompt text-xs font-bold px-3 py-1 rounded-full">
                    {selectedItem.categoryLabel}
                  </span>
                  <span className="bg-[#A855F7] text-white font-prompt text-xs font-bold px-3 py-1 rounded-full">
                    {selectedItem.stats}
                  </span>
                </div>

                <h3 className="font-prompt font-black text-3xl text-white mb-2">
                  {selectedItem.title}
                </h3>
                <p className="font-kanit text-gray-300 text-base font-light mb-6">
                  {selectedItem.description}
                </p>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-2.5 rounded-xl border-2 border-white/20 text-white font-prompt font-semibold hover:bg-white/10"
                  >
                    ปิดหน้าต่าง
                  </button>
                  <a
                    href="#cta"
                    onClick={() => setSelectedItem(null)}
                    className="glow-button-lime px-6 py-2.5 rounded-xl font-prompt font-bold"
                  >
                    ทดลองใช้งานระบบนี้
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
