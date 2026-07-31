"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";
import { ChevronDown, MessageSquare, Phone, Mail } from "lucide-react";

export default function HelpCenterPage() {
  const [activeAcc, setActiveAcc] = useState<string>("shipping");

  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 pt-24 pb-20 font-kanit">
        <h1 className="font-prompt font-black text-2xl sm:text-3xl uppercase mb-2 text-center">
          ศูนย์ช่วยเหลือ & คำถามที่พบบ่อย (Help Center & FAQ)
        </h1>
        <p className="text-xs text-neutral-500 text-center font-light mb-10">
          คำถามเกี่ยวกับการสั่งซื้อ การชำระเงิน การจัดส่งสินค้า และนโยบายการเปลี่ยนคืน
        </p>

        {/* FAQ Accordion */}
        <div className="bg-white border border-neutral-200 divide-y divide-neutral-200 mb-12 shadow-xs">
          {[
            { id: "shipping", title: "🚚 ระยะเวลาและค่าจัดส่งสินค้า", content: "จัดส่งฟรีทั่วประเทศทุกออเดอร์ ไม่มีขั้นต่ำ / ระยะเวลาจัดส่ง กรุงเทพฯ 1-2 วันทำการ, ต่างจังหวัด 2-3 วันทำการ โดย Kerry Express" },
            { id: "payment", title: "💳 ช่องทางการชำระเงิน", content: "รองรับการชำระเงินด้วย PromptPay QR Code ทุกธนาคารเรียลไทม์ และบัตรเครดิต/เดบิต" },
            { id: "return", title: "🔄 นโยบายการเปลี่ยนไซส์และคืนสินค้า", content: "สามารถเปลี่ยนไซส์หรือคืนสินค้าได้ภายใน 7 วันทำการ นับจากวันที่ได้รับพัสดุ สินค้าต้องอยู่ในสภาพสมบูรณ์ ไม่ผ่านการซัก และมีป้ายสินค้าครบถ้วน" },
            { id: "jps", title: "⭐ คะแนนสะสม JPS Club", content: "ทุกการช้อป 25 บาท รับ 1 คะแนน JPS Points สะสมครบ 100 คะแนน ใช้แลกรับส่วนลด 100 บาทในออเดอร์ถัดไป" }
          ].map(acc => (
            <div key={acc.id} className="p-4">
              <button
                onClick={() => setActiveAcc(activeAcc === acc.id ? "" : acc.id)}
                className="w-full flex justify-between items-center font-bold text-sm text-black text-left"
              >
                <span>{acc.title}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAcc === acc.id ? "rotate-180" : ""}`} />
              </button>
              {activeAcc === acc.id && (
                <p className="mt-3 text-xs text-neutral-600 font-light leading-relaxed pl-3 border-l-2 border-black">
                  {acc.content}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Contact Us Box */}
        <div className="bg-neutral-900 text-white p-8 text-center space-y-4">
          <h3 className="font-prompt font-black text-xl uppercase">ต้องการความช่วยเหลือเพิ่มเติม?</h3>
          <p className="text-xs text-neutral-300">ทีมงานบริการลูกค้า TukShop พร้อมดูแลคุณทุกวัน เวลา 09:00 - 22:00 น.</p>
          <div className="flex justify-center gap-4 pt-2">
            <a href="https://line.me" target="_blank" rel="noreferrer" className="bg-[#00B900] text-white text-xs font-bold px-5 py-2.5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> LINE OA Support
            </a>
          </div>
        </div>

      </main>

      <CtaFooter />
    </div>
  );
}
