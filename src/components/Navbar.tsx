"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles, Menu, X, ArrowUpRight, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "หน้าแรก", href: "#hero" },
    { name: "ฟีเจอร์เด่น", href: "#features" },
    { name: "ผลงาน & ระบบ", href: "#portfolio" },
    { name: "แพ็กเกจราคา", href: "#pricing" },
    { name: "รีวิวลูกค้า", href: "#testimonials" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${
          scrolled
            ? "glass-neo-card border-2 border-[#CCFF00]/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3 px-6"
            : "bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 py-4 px-6"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 bg-[#CCFF00] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#A855F7] group-hover:rotate-6 transition-transform">
              <ShoppingBag className="w-6 h-6 text-black" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF5722] rounded-full animate-ping" />
            </div>
            <div className="flex flex-col">
              <span className="font-prompt font-black text-2xl tracking-tighter text-white flex items-center gap-1">
                TUK<span className="text-[#CCFF00]">SHOP</span>
                <span className="text-xs bg-[#A855F7] text-white font-semibold px-2 py-0.5 rounded-full border border-white/20">
                  v2.5
                </span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                Neo Commerce OS
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-prompt font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-all flex items-center gap-1 hover:text-[#CCFF00]"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#pricing"
              className="text-sm font-prompt font-semibold text-gray-300 hover:text-[#CCFF00] transition-colors"
            >
              เข้าสู่ระบบ
            </a>
            <a
              href="#cta"
              className="glow-button-lime px-5 py-2.5 rounded-xl text-sm font-prompt tracking-wide font-bold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>เริ่มต้นใช้งานฟรี</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 bg-black border-2 border-[#CCFF00] text-[#CCFF00] rounded-xl shadow-[3px_3px_0px_0px_#A855F7]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-3 max-w-7xl mx-auto bg-[#0A0A0A] border-2 border-[#CCFF00] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#A855F7]"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-prompt font-bold text-gray-200 hover:text-[#CCFF00] py-2 border-b border-gray-800"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-2 flex flex-col gap-3">
                <a
                  href="#cta"
                  onClick={() => setMobileMenuOpen(false)}
                  className="glow-button-lime w-full justify-center py-3 rounded-xl font-prompt font-bold flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>เริ่มต้นใช้งานฟรี 14 วัน</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
