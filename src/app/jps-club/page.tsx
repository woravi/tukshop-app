"use client";

import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";
import { Award, Gift, Percent, Sparkles } from "lucide-react";

export default function JpsClubPage() {
  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 pt-24 pb-20 font-kanit">
        <div className="bg-neutral-900 text-white p-10 text-center mb-10 border border-black shadow-xl">
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 block mb-2">
            EXCLUSIVE LOYALTY PROGRAM
          </span>
          <h1 className="font-prompt font-black text-3xl sm:text-4xl uppercase mb-3 text-white">
            JPS CLUB MEMBERSHIP
          </h1>
          <p className="text-xs text-neutral-300 max-w-lg mx-auto font-light">
            สิทธิพิเศษเหนือระดับสำหรับสมาชิก JPS Club รับคะแนนสะสม สิทธิประโยชน์วันเกิด และดีลพิเศษก่อนใคร
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-neutral-50 border border-neutral-200 text-center space-y-2">
            <Percent className="w-8 h-8 mx-auto text-black" />
            <h3 className="font-bold text-sm text-black">สะสมคะแนนทุกออเดอร์</h3>
            <p className="text-xs text-neutral-500 font-light">ทุก 25 บาท รับ 1 คะแนน JPS Points สะสมนำไปแลกส่วนลดได้ทันที</p>
          </div>
          <div className="p-6 bg-neutral-50 border border-neutral-200 text-center space-y-2">
            <Gift className="w-8 h-8 mx-auto text-black" />
            <h3 className="font-bold text-sm text-black">ของขวัญเดือนเกิด</h3>
            <p className="text-xs text-neutral-500 font-light">รับส่วนลดพิเศษ 15% ในเดือนเกิดของคุณเมื่อช้อปสินค้าทุกหมวดหมู่</p>
          </div>
          <div className="p-6 bg-neutral-50 border border-neutral-200 text-center space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-black" />
            <h3 className="font-bold text-sm text-black">สิทธิ์ช้อปสินค้าใหม่ก่อนใคร</h3>
            <p className="text-xs text-neutral-500 font-light">รับสิทธิ์จองคอลเลกชันใหม่ล่วงหน้าก่อนวางจำหน่ายหน้าร้านทั่วไป</p>
          </div>
        </div>
      </main>

      <CtaFooter />
    </div>
  );
}
