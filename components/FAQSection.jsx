"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "จะดูรายละเอียดกระเป๋าเพิ่มเติมได้ที่ไหน?",
    answer: "ตรวจสอบรูปภาพและรายละเอียดบนหน้าสินค้า หากยังไม่มีข้อมูลที่ต้องการ กรุณาสอบถามร้านก่อนสั่งซื้อ",
  },
  {
    question: "การจัดส่งและคืนสินค้ามีเงื่อนไขอย่างไร?",
    answer: "อ่านข้อมูลในหน้าการจัดส่งและคืนสินค้า และติดต่อร้านเพื่อยืนยันค่าจัดส่ง ระยะเวลา พื้นที่จัดส่ง และเงื่อนไขการคืนสินค้าสำหรับคำสั่งซื้อของคุณ",
    href: "/shipping-returns",
    label: "ดูข้อมูลการจัดส่งและคืนสินค้า",
  },
  {
    question: "สินค้ามีการรับประกันหรือไม่?",
    answer: "ตรวจสอบข้อมูลในหน้าการรับประกัน และสอบถามเงื่อนไขของสินค้าแต่ละรุ่นกับร้านก่อนสั่งซื้อ",
    href: "/warranty",
    label: "ดูข้อมูลการรับประกัน",
  },
  {
    question: "ชำระเงินด้วยวิธีใดได้บ้าง?",
    answer: "ตรวจสอบช่องทางที่แสดงในขั้นตอนชำระเงิน หากมีข้อสงสัย กรุณาติดต่อร้านก่อนชำระเงิน",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="mt-8 rounded-xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-stone-900">คำถามเกี่ยวกับสินค้าและการสั่งซื้อ</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={faq.question} className="border-b border-stone-200">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
              aria-controls={`product-faq-${index}`}
              className="flex w-full items-center justify-between gap-4 py-4 text-left font-semibold focus-visible:outline focus-visible:outline-2"
            >
              {faq.question}
              {openIndex === index ? <ChevronUp aria-hidden="true" className="h-6 w-6 shrink-0" /> : <ChevronDown aria-hidden="true" className="h-6 w-6 shrink-0" />}
            </button>
            <div id={`product-faq-${index}`} hidden={openIndex !== index} className="pb-4 text-stone-700">
              <p>{faq.answer}</p>
              {faq.href && <Link href={faq.href} className="mt-3 inline-block underline underline-offset-4">{faq.label}</Link>}
            </div>
          </div>
        ))}
      </div>
      <Link href="/contact" className="mt-6 inline-block underline underline-offset-4">สอบถามร้านเพิ่มเติม</Link>
    </section>
  );
}
