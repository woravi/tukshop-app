"use client";

import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";
import { MapPin, Phone, Clock } from "lucide-react";

export default function StoreLocatorPage() {
  const stores = [
    {
      name: "TukShop Flagship Store @ CentralWorld",
      address: "ชั้น 2 โซน Beacon, ศูนย์การค้าเซ็นทรัลเวิลด์ ถนนราชดำริ แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ",
      phone: "02-123-4567",
      hours: "10:00 - 22:00 น. ทุกวัน"
    },
    {
      name: "TukShop Boutique @ Siam Paragon",
      address: "ชั้น 1 โซน Fashion Hall, ศูนย์การค้าสยามพารากอน ถนนพระราม 1 เขตปทุมวัน กรุงเทพฯ",
      phone: "02-987-6543",
      hours: "10:00 - 22:00 น. ทุกวัน"
    },
    {
      name: "TukShop Studio @ EmQuartier",
      address: "ชั้น M โซน Waterfall Quartier, ศูนย์การค้าเอ็มควอเทียร์ ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ",
      phone: "02-555-8888",
      hours: "10:00 - 22:00 น. ทุกวัน"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-24 pb-20 font-kanit">
        <h1 className="font-prompt font-black text-2xl sm:text-3xl uppercase mb-2 text-center">
          ค้นหาสาขาร้าน (Store Locator)
        </h1>
        <p className="text-xs text-neutral-500 text-center font-light mb-10">
          เยี่ยมชมแฟล็กชิปสโตร์สัมผัสและทดลองสวมใส่สินค้าจริงได้ทุกวัน
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stores.map((st, idx) => (
            <div key={idx} className="bg-white border border-neutral-200 p-6 space-y-3 hover:border-black transition-colors shadow-xs">
              <span className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase block w-max">
                STORE #0{idx + 1}
              </span>
              <h3 className="font-bold text-sm text-black">{st.name}</h3>
              <p className="text-xs text-neutral-600 font-light flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-black mt-0.5" />
                <span>{st.address}</span>
              </p>
              <p className="text-xs text-neutral-600 flex items-center gap-2 font-mono">
                <Phone className="w-3.5 h-3.5 shrink-0 text-black" />
                <span>{st.phone}</span>
              </p>
              <p className="text-xs text-neutral-600 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0 text-black" />
                <span>{st.hours}</span>
              </p>
            </div>
          ))}
        </div>
      </main>

      <CtaFooter />
    </div>
  );
}
