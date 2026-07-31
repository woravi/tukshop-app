"use client";

import { motion } from "framer-motion";
import { CreditCard, Gift, ShieldCheck, Truck, ArrowRight } from "lucide-react";

export default function FeaturesSection() {
  const perks = [
    {
      icon: CreditCard,
      title: "ช้อปก่อน, จ่ายทีหลัง",
      description: "ตัวเลือกการผ่อนชำระที่ยืดหยุ่น ผ่านพันธมิตรธนาคารชั้นนำ, ShopeePay และ SPayLater 0%*",
      action: "อ่านรายละเอียด",
      link: "#perks"
    },
    {
      icon: Gift,
      title: "สิทธิพิเศษสำหรับสมาชิก",
      description: "รับโค้ดส่วนลด 10% ไม่มีขั้นต่ำ สำหรับออเดอร์แรกของคุณเมื่อลงทะเบียนสมาชิกใหม่",
      action: "ลงทะเบียนสมาชิกเลย",
      link: "#perks"
    },
    {
      icon: ShieldCheck,
      title: "สมาชิก JPS CLUB",
      description: "รับโค้ดส่วนลดสูงสุด 10% เพียงแจ้งอีเมลและเบอร์โทรที่ใช้ลงทะเบียนกับเจ้าหน้าที่",
      action: "รายละเอียดเพิ่มเติม",
      link: "#perks"
    },
    {
      icon: Truck,
      title: "จัดส่งฟรี ไม่มีขั้นต่ำ",
      description: "บริการจัดส่งด่วนฟรีถึงบ้านทั่วประเทศไทย ปลอดภัย ตรวจสอบสถานะพัสดุได้ตลอด 24 ชม.",
      action: "เช็คสถานะการจัดส่ง",
      link: "#perks"
    },
  ];

  return (
    <section id="perks" className="py-16 px-4 sm:px-8 bg-white border-b border-neutral-200 font-prompt">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-400 block mb-1">
            WHY SHOP WITH US
          </span>
          <h2 className="font-prompt font-black text-2xl sm:text-3xl text-black uppercase">
            สิทธิพิเศษและบริการสำหรับลูกค้า
          </h2>
          <p className="font-kanit text-xs text-neutral-500 font-light mt-1">
            TukShop Group - ผู้นำในธุรกิจแฟชั่นไลฟ์สไตล์ของประเทศไทย
          </p>
        </div>

        {/* Studiofour 4-Column Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="bg-neutral-50 border border-neutral-200 p-6 flex flex-col justify-between hover:border-black hover:bg-white transition-all duration-300 group"
              >
                <div>
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>

                  <h3 className="font-prompt font-bold text-base text-black mb-2 uppercase">
                    {perk.title}
                  </h3>
                  <p className="font-kanit text-xs text-neutral-600 font-light leading-relaxed mb-6">
                    {perk.description}
                  </p>
                </div>

                <a
                  href={perk.link}
                  className="text-[11px] font-prompt font-bold text-black uppercase tracking-wider hover:underline flex items-center gap-1.5 pt-4 border-t border-neutral-200"
                >
                  <span>{perk.action}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
