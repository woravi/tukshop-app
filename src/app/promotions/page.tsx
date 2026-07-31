"use client";

import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";
import { Tag, Clock, Check } from "lucide-react";
import Link from "next/link";

export default function PromotionsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 pt-24 pb-20 font-kanit">
        <h1 className="font-prompt font-black text-2xl sm:text-3xl uppercase mb-2 text-center">
          โปรโมชัน & โค้ดส่วนลดพิเศษ (Promotions & Vouchers)
        </h1>
        <p className="text-xs text-neutral-500 text-center font-light mb-10">
          โค้ดส่วนลดและแคมเปญพิเศษประจำเดือนจาก TukShop
        </p>

        <div className="space-y-4 mb-12">
          
          <div className="p-6 bg-neutral-900 text-white border border-black flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-mono font-bold bg-amber-400 text-black px-2 py-0.5 uppercase block w-max mb-1">
                NEW CUSTOMER VOUCHER
              </span>
              <h3 className="font-prompt font-black text-lg text-white">ส่วนลด 10% สำหรับสมาชิกใหม่</h3>
              <p className="text-xs text-neutral-300 font-light">เมื่อช้อปสินค้าครบ 1,500 บาทขึ้นไป</p>
            </div>
            <div className="bg-white text-black p-3 text-center border border-dashed border-neutral-400">
              <span className="text-[10px] text-neutral-500 font-mono block">PROMO CODE</span>
              <span className="font-mono font-black text-base text-black tracking-widest">WELCOME10</span>
            </div>
          </div>

          <div className="p-6 bg-neutral-100 border border-neutral-300 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase block w-max mb-1">
                FREE SHIPPING
              </span>
              <h3 className="font-prompt font-black text-lg text-black">จัดส่งฟรีทั่วประเทศ</h3>
              <p className="text-xs text-neutral-600 font-light">ฟรีค่าจัดส่งทุกออเดอร์ ไม่มีขั้นต่ำ</p>
            </div>
            <div className="bg-green-600 text-white px-4 py-2 text-xs font-bold uppercase">
              รับสิทธิ์อัตโนมัติ
            </div>
          </div>

        </div>
      </main>

      <CtaFooter />
    </div>
  );
}
