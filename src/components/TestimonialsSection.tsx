"use client";

import { motion } from "framer-motion";
import { Star, Quote, CheckCircle } from "lucide-react";

export default function TestimonialsSection() {
  const reviews = [
    {
      name: "คุณธนกร เลิศวิเชียร",
      role: "เจ้าของแบรนด์ Urban Streetwear",
      store: "TukTuk Apparel",
      avatar: "👨‍💻",
      comment: "หลังจากเปลี่ยนมาใช้ TukShop ยอดขายหน้าร้านและออนไลน์เพิ่มขึ้น 300% สต็อกไม่เคยตัดพลาดอีกเลย ดีไซน์ระบบสวยและเร็วมากครับ!",
      rating: 5,
      accent: "#CCFF00",
    },
    {
      name: "คุณศิริพร บุญเจริญ",
      role: "Founder & CEO",
      store: "Matcha House BKK",
      avatar: "👩‍💼",
      comment: "หน้าตา Neo-Brutalism สวยโดดเด่นไม่ซ้ำใคร ลูกค้าและพนักงานชอบมาก คิดเงินไวใน 0.2 วินาที ออกใบเสร็จ QR ได้ทันที คุ้มราคาที่สุด!",
      rating: 5,
      accent: "#A855F7",
    },
    {
      name: "คุณภัทรพงศ์ วงศ์สวัสดิ์",
      role: "Managing Director",
      store: "Neo Tech Retail 5 สาขา",
      avatar: "🧑‍เทคโนโลยี",
      comment: "ระบบ AI Analytics ของ TukShop ช่วยทำนายว่าสินค้าชิ้นไหนจะขาดสต็อกได้อย่างแม่นยำ ทีมซัพพอร์ตช่วยเหลือตลอด 24 ชั่วโมงดีมากครับ",
      rating: 5,
      accent: "#FF5722",
    },
  ];

  return (
    <section id="testimonials" className="py-28 px-4 sm:px-8 bg-neo-grid relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black border border-[#CCFF00] rounded-full shadow-[3px_3px_0px_0px_#A855F7] mb-4">
            <Star className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" />
            <span className="font-prompt text-xs font-bold text-white tracking-widest uppercase">
              CUSTOMER TESTIMONIALS
            </span>
          </div>
          <h2 className="font-prompt font-black text-4xl sm:text-6xl text-white tracking-tight mb-4">
            เสียงตอบรับจากผู้ใช้งานจริง <br />
            <span className="text-gradient-lime-purple">ทั่วประเทศไทย</span>
          </h2>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="glass-neo-card p-8 rounded-3xl relative flex flex-col justify-between border-2 border-white/10 hover:border-[#CCFF00] transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.08)] hover:shadow-[6px_6px_0px_0px_#A855F7]"
            >
              <div>
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1 text-[#CCFF00]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#CCFF00]" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-white/20" />
                </div>

                <p className="font-kanit text-gray-200 text-base font-light leading-relaxed mb-6 italic">
                  "{review.comment}"
                </p>
              </div>

              {/* User Info */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 border-black shadow-[2px_2px_0px_0px_#0A0A0A]"
                  style={{ backgroundColor: review.accent }}
                >
                  {review.avatar}
                </div>
                <div>
                  <h4 className="font-prompt font-bold text-white text-base flex items-center gap-1.5">
                    {review.name}
                    <CheckCircle className="w-4 h-4 text-[#CCFF00] fill-black" />
                  </h4>
                  <p className="font-kanit text-xs text-gray-400 font-light">
                    {review.role} • <strong className="text-[#CCFF00] font-normal">{review.store}</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
