"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X, 
  Globe, 
  ChevronDown, 
  ArrowRight,
  Heart
} from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);

  const announcements = [
    "จัดส่งฟรี ไม่มีขั้นต่ำ ระหว่างวันที่ 16 ก.ค. 2569 ถึง 16 ส.ค. 2569",
    "ช้อปก่อน จ่ายทีหลัง กับบริการผ่อนชำระ 0%*",
    "รับส่วนลด 10% สำหรับออเดอร์แรกของคุณ [ลงทะเบียนเลย]",
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white font-prompt">
      {/* 1. studiofour Top Announcement Ticker Bar */}
      <div className="bg-black text-white text-[11px] py-2 px-4 text-center font-normal tracking-wide flex items-center justify-center border-b border-neutral-800 relative z-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAnnouncement}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 cursor-pointer hover:underline"
          >
            <span>{announcements[activeAnnouncement]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Main Luxury Header */}
      <div className={`w-full transition-all duration-300 border-b border-neutral-200 ${scrolled ? "py-3 shadow-xs" : "py-4"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-black hover:opacity-70"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo - studiofour style */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-prompt font-black text-2xl tracking-tighter text-black uppercase">
              Tuk<span className="font-light tracking-widest text-neutral-800">Shop</span> <span className="text-xs font-normal text-neutral-500 font-mono tracking-widest border border-neutral-300 px-1 py-0.5 ml-1">TH</span>
            </span>
          </Link>

          {/* Top Right Utility Bar (Account, Search, Cart) */}
          <div className="flex items-center gap-6 text-xs text-neutral-800">

            {/* Customer Register Member Button */}
            <Link 
              href="/login" 
              className="bg-black text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-2xs font-prompt"
              title="สมัครสมาชิกใหม่รับส่วนลด 10%"
            >
              <User className="w-3.5 h-3.5" />
              <span>✨ สมัครสมาชิก</span>
            </Link>

            {/* Admin Back-Office Link */}
            <Link href="/admin" className="hidden sm:flex items-center gap-1.5 font-bold text-black hover:underline uppercase tracking-wider bg-neutral-100 border border-neutral-300 px-2.5 py-1">
              <User className="w-3.5 h-3.5" />
              <span>ระบบหลังบ้าน (Admin)</span>
            </Link>

            {/* Search Trigger */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="flex items-center gap-1.5 hover:text-black font-medium"
            >
              <Search className="w-4 h-4 text-black" />
              <span className="hidden md:inline">เปิดการค้นหา</span>
            </button>

            {/* Cart Icon & Counter */}
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 hover:text-black font-semibold relative bg-black text-white px-3 py-1.5 text-[11px] uppercase tracking-wider"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
              <span>ตะกร้า (2)</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Main Studiofour Navigation Categories (Mega Menu Bar) */}
      <nav className="hidden lg:block border-b border-neutral-200 bg-white text-xs font-semibold uppercase tracking-wider py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8">
          
          {/* สินค้าใหม่ */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/category/new-arrivals" className="hover:text-neutral-600 flex items-center gap-1">
              <span>สินค้าใหม่</span>
              <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="megamenu-dropdown absolute top-full left-0 w-52 bg-white border border-neutral-200 shadow-xl p-4 flex flex-col gap-2 font-kanit font-normal text-neutral-700 text-xs">
              <Link href="/category/new-arrivals" className="hover:text-black font-medium py-1 border-b border-neutral-100">สินค้าใหม่ทั้งหมด</Link>
              <Link href="/category/women" className="hover:text-black py-1">สินค้าใหม่ - ผู้หญิง</Link>
              <Link href="/category/men" className="hover:text-black py-1">สินค้าใหม่ - ผู้ชาย</Link>
              <Link href="/category/accessories" className="hover:text-black py-1">สินค้าใหม่ - แอคเซสเซอรี่</Link>
            </div>
          </div>

          {/* แบรนด์ */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/brands/QUINN" className="hover:text-neutral-600 flex items-center gap-1">
              <span>แบรนด์</span>
              <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="megamenu-dropdown absolute top-full left-0 w-64 bg-white border border-neutral-200 shadow-xl p-4 grid grid-cols-2 gap-2 font-kanit font-normal text-neutral-700 text-xs">
              <Link href="/brands/QUINN" className="col-span-2 font-bold text-black border-b border-neutral-100 pb-1">แบรนด์ทั้งหมด</Link>
              <Link href="/brands/QUINN" className="hover:text-black font-bold">QUINN</Link>
              <Link href="/brands/SATUR" className="hover:text-black font-bold">SATUR</Link>
              <Link href="/brands/MELISSA" className="hover:text-black font-bold">MELISSA</Link>
            </div>
          </div>

          {/* ผู้หญิง */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/category/women" className="hover:text-neutral-600 flex items-center gap-1">
              <span>ผู้หญิง</span>
              <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="megamenu-dropdown absolute top-full left-0 w-56 bg-white border border-neutral-200 shadow-xl p-4 flex flex-col gap-2 font-kanit font-normal text-neutral-700 text-xs">
              <Link href="/category/women" className="hover:text-black font-medium py-1 border-b border-neutral-100">สินค้าผู้หญิงทั้งหมด</Link>
              <Link href="/category/women" className="hover:text-black py-1">เสื้อผ้าผู้หญิง (แจ็คเก็ต, เดรส, เสื้อยืด)</Link>
              <Link href="/category/accessories" className="hover:text-black py-1">กระเป๋าและกระเป๋าสตางค์</Link>
            </div>
          </div>

          {/* ผู้ชาย */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/category/men" className="hover:text-neutral-600 flex items-center gap-1">
              <span>ผู้ชาย</span>
              <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="megamenu-dropdown absolute top-full left-0 w-56 bg-white border border-neutral-200 shadow-xl p-4 flex flex-col gap-2 font-kanit font-normal text-neutral-700 text-xs">
              <Link href="/category/men" className="hover:text-black font-medium py-1 border-b border-neutral-100">สินค้าผู้ชายทั้งหมด</Link>
              <Link href="/category/men" className="hover:text-black py-1">เสื้อคาร์ดิแกน & แจ็คเก็ต</Link>
              <Link href="/category/accessories" className="hover:text-black py-1">หมวกแก๊ป & แอคเซสเซอรี่</Link>
            </div>
          </div>

          {/* เด็ก */}
          <a href="#products" className="hover:text-neutral-600 py-1">เด็ก</a>

          {/* สินค้าลดราคา */}
          <a href="#products" className="text-red-600 hover:text-red-700 font-bold py-1">สินค้าลดราคา</a>

          {/* คอลเลกชันพิเศษ & เทรนด์ */}
          <a href="#products" className="hover:text-neutral-600 py-1">คอลเลกชันพิเศษ & เทรนด์</a>

          {/* โปรโมชั่นออนไลน์ */}
          <a href="#perks" className="hover:text-neutral-600 py-1">โปรโมชั่นออนไลน์</a>

          {/* เกี่ยวกับเรา */}
          <a href="#about" className="hover:text-neutral-600 py-1">เกี่ยวกับ TukShop</a>

        </div>
      </nav>

      {/* Search Input Bar (Expandable) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-100 border-b border-neutral-200 p-4"
          >
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <Search className="w-5 h-5 text-neutral-500" />
              <input
                type="text"
                placeholder="ค้นหาแบรนด์, เสื้อผ้า, รองเท้า, คอลเลกชันพิเศษ..."
                className="w-full bg-transparent text-sm text-black focus:outline-none font-kanit"
                autoFocus
              />
              <button onClick={() => setSearchOpen(false)} className="text-xs font-semibold uppercase text-neutral-600 hover:text-black">
                ปิด
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Drawer Modal */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end cursor-pointer"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between cursor-default shadow-2xl font-prompt"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
                  <h3 className="font-bold text-lg uppercase tracking-wider text-black flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span>ตะกร้าสินค้า (2 รายการ)</span>
                  </h3>
                  <button onClick={() => setCartOpen(false)} className="p-1 text-black hover:opacity-70">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="space-y-4 font-kanit">
                  <div className="flex gap-4 p-3 border border-neutral-200">
                    <div className="w-16 h-20 bg-neutral-100 shrink-0 relative overflow-hidden">
                      <img src="/images/fashion_jacket.jpg" alt="Jacket" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase">AETHERIS</span>
                        <h4 className="text-xs font-bold text-black">แจ็คเก็ตฮู้ดดี้แต่งซิป AETHERIS Noir</h4>
                        <span className="text-xs text-neutral-500">ไซส์: L</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>1 x ฿4,990</span>
                        <button className="text-neutral-400 hover:text-red-600 text-[10px]">ลบออก</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 p-3 border border-neutral-200">
                    <div className="w-16 h-20 bg-neutral-100 shrink-0 relative overflow-hidden">
                      <img src="/images/tukshop_pos.jpg" alt="Pack & Go" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase">MELISSA</span>
                        <h4 className="text-xs font-bold text-black">NEW🎁 Melissa Pack & Go (Free Gift)</h4>
                        <span className="text-xs text-green-600 font-semibold">100% OFF (ฟรีแถม)</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="line-through text-neutral-400">฿1,290</span>
                        <span className="text-black">฿0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cart Footer */}
              <div className="pt-6 border-t border-neutral-200">
                <div className="flex justify-between text-sm font-bold text-black mb-2 font-prompt">
                  <span>ยอดรวมสินค้า</span>
                  <span>฿4,990</span>
                </div>
                <p className="text-xs font-kanit text-neutral-500 mb-4">
                  จัดส่งฟรีทั่วประเทศ • สามารถผ่อนชำระ 0% นานสูงสุด 10 เดือน
                </p>
                <button className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-4 hover:bg-neutral-800 transition-colors">
                  ดำเนินการชำระเงิน
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-neutral-200 px-6 py-6 font-prompt shadow-xl overflow-hidden"
          >
            <div className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-wider text-neutral-900">
              {/* Mobile Register Member Button */}
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="bg-black text-white text-xs font-bold uppercase tracking-widest p-3 text-center flex items-center justify-center gap-2 mb-2 font-prompt shadow-md"
              >
                <User className="w-4 h-4" />
                <span>✨ สมัครสมาชิก (รับส่วนลด 10%)</span>
              </Link>

              <Link href="/category/new-arrivals" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-neutral-100">สินค้าใหม่</Link>
              <Link href="/category/women" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-neutral-100">ผู้หญิง</Link>
              <Link href="/category/men" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-neutral-100">ผู้ชาย</Link>
              <Link href="/category/accessories" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-neutral-100">แอคเซสเซอรี่ & หมวก</Link>
              <Link href="/category/sale" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-neutral-100 text-red-600 font-bold">สินค้าลดราคา</Link>
              <Link href="/promotions" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-neutral-100">โปรโมชัน & โค้ดส่วนลด</Link>
              <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-neutral-100">ติดตามสถานะพัสดุ</Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-2">เข้าสู่ระบบ / ลงทะเบียน</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
