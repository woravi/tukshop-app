"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Package, Truck, CheckCircle2, Clock, Printer, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";

export default function OrderTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<any | null>({
    id: "ord-178546123",
    customerName: "คุณอนันต์ ชัยเจริญ",
    phone: "081-234-5678",
    date: "2026-07-31 10:45:00",
    status: "PAID",
    trackingNumber: "KERRY-TK-8899201",
    courier: "Kerry Express",
    totalAmount: 8580,
    items: [
      { title: "NEW แจ็คเก็ตฮู้ดดี้แต่งซิปคู่ (Size M)", price: 4990, quantity: 1, image: "/images/fashion_jacket.jpg" },
      { title: "NEW Loren Linen Cardigan Black (Size L)", price: 3590, quantity: 1, image: "/images/fashion_jacket.jpg" }
    ]
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        const found = data.orders.find((o: any) => 
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
          o.phone.includes(searchQuery)
        );
        if (found) {
          setSearchedOrder({
            ...found,
            trackingNumber: found.trackingNumber || "KERRY-TK-8899201",
            courier: "Kerry Express"
          });
        }
      }
    } catch (err) {
      console.error("Order search error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 pt-24 pb-20">
        
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-black hover:text-white text-black font-kanit font-bold text-xs px-4 py-2 border border-neutral-300 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← กลับสู่หน้าหลัก (Back to Home)</span>
          </Link>
        </div>

        <h1 className="font-prompt font-black text-2xl sm:text-3xl uppercase mb-2 text-center">
          ติดตามสถานะคำสั่งซื้อ & พัสดุ (Order Tracking)
        </h1>
        <p className="font-kanit text-xs text-neutral-500 text-center font-light mb-8">
          กรอกรหัสคำสั่งซื้อ (เช่น ord-178546123) หรือเบอร์โทรศัพท์เพื่อตรวจสอบสถานะจัดส่งเรียลไทม์
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-10">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ใส่รหัสคำสั่งซื้อ หรือเบอร์โทรศัพท์..."
            className="flex-1 bg-white border border-neutral-300 text-xs px-4 py-3 focus:outline-none focus:border-black font-kanit shadow-xs"
          />
          <button type="submit" className="bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-3 flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>ค้นหาพัสดุ</span>
          </button>
        </form>

        {searchedOrder && (
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 font-kanit shadow-xs space-y-6">
            
            {/* Header Status */}
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-neutral-200 gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase block w-max mb-1">
                  ORDER ID: #{searchedOrder.id}
                </span>
                <h3 className="font-bold text-sm text-black">ผู้รับ: {searchedOrder.customerName} ({searchedOrder.phone})</h3>
                <span className="text-xs text-neutral-400 font-mono">วันที่สั่งซื้อ: {searchedOrder.date}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">ยอดชำระสุทธิ</span>
                <span className="font-prompt font-black text-xl text-black">฿{searchedOrder.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Tracking Progression Bar */}
            <div>
              <h4 className="font-bold text-xs text-black uppercase mb-4">สถานะการจัดส่งพัสดุ:</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-neutral-100 border-2 border-black">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <span className="font-bold text-black block">1. ชำระเงินเรียบร้อย</span>
                  <span className="text-[10px] text-neutral-500 font-mono">อนุมัติแล้ว</span>
                </div>
                <div className="p-3 bg-neutral-100 border-2 border-black">
                  <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <span className="font-bold text-black block">2. แพ็กสินค้าเสร็จสิ้น</span>
                  <span className="text-[10px] text-neutral-500 font-mono">เตรียมส่งพัสดุ</span>
                </div>
                <div className="p-3 bg-green-50 border-2 border-green-600">
                  <Truck className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <span className="font-bold text-green-700 block">3. อยู่ระหว่างขนส่ง</span>
                  <span className="text-[10px] text-green-600 font-mono font-bold">{searchedOrder.trackingNumber}</span>
                </div>
              </div>
            </div>

            {/* Courier Info */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-black block">ผู้ขนส่ง: {searchedOrder.courier}</span>
                <span className="text-neutral-500 font-mono">เลขพัสดุ: {searchedOrder.trackingNumber}</span>
              </div>
              <a
                href="https://th.kerryexpress.com/th/track/"
                target="_blank"
                rel="noreferrer"
                className="bg-black text-white text-[10px] font-bold uppercase px-3 py-1.5 hover:bg-neutral-800"
              >
                เช็คเลข Kerry
              </a>
            </div>

            {/* Order Items List */}
            <div>
              <h4 className="font-bold text-xs text-black uppercase mb-3">รายการสินค้าในออเดอร์:</h4>
              <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
                {searchedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-black block">{item.title}</span>
                      <span className="text-neutral-500 font-mono">จำนวน: {item.quantity} ชิ้น</span>
                    </div>
                    <span className="font-mono font-bold text-black">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      <CtaFooter />
    </div>
  );
}
