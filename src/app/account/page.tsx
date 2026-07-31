"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Award, ShoppingBag, MapPin, LogOut, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";

export default function AccountProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const userName = session?.user?.name || "";
  const email = session?.user?.email || "";
  const phone = "081-234-5678";
  const points = 350;
  const tier = "JPS PLATINUM";

  if (status !== "authenticated") {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-24 pb-20">
        
        <h1 className="font-prompt font-black text-2xl sm:text-3xl uppercase mb-8 pb-4 border-b border-neutral-200">
          บัญชีสมาชิก & คะแนนสะสม JPS CLUB
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: User Card & Tier (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 font-kanit">
            
            <div className="bg-neutral-900 text-white p-6 border border-black shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white text-black font-black font-prompt text-xl flex items-center justify-center">
                  {userName.substring(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{userName}</h3>
                  <span className="text-[10px] font-mono text-neutral-400 block">{email}</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-800 border border-neutral-700 space-y-2 mt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 font-mono">REWARD TIER</span>
                  <span className="font-prompt font-bold text-amber-400 text-xs">{tier}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-neutral-700">
                  <span className="text-neutral-400 font-mono">JPS POINTS</span>
                  <span className="font-prompt font-black text-xl text-white">{points} คะแนน</span>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-500 py-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-2 text-xs font-semibold">
              <Link href="/orders" className="flex items-center gap-2 p-2 hover:bg-neutral-200 block text-black">
                <ShoppingBag className="w-4 h-4" />
                <span>ประวัติการสั่งซื้อสินค้า</span>
              </Link>
              <Link href="/wishlist" className="flex items-center gap-2 p-2 hover:bg-neutral-200 block text-black">
                <User className="w-4 h-4" />
                <span>รายการสินค้าที่ชอบ (Wishlist)</span>
              </Link>
              <Link href="/jps-club" className="flex items-center gap-2 p-2 hover:bg-neutral-200 block text-black">
                <Award className="w-4 h-4" />
                <span>สิทธิประโยชน์สมาชิก JPS Club</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Order History & Saved Address (8 Cols) */}
          <div className="lg:col-span-8 space-y-6 font-kanit">
            
            <div className="bg-white border border-neutral-200 p-6 space-y-4">
              <h3 className="font-prompt font-black text-lg text-black uppercase pb-3 border-b border-neutral-200">
                ประวัติคำสั่งซื้อล่าสุด (Recent Orders)
              </h3>

              <div className="space-y-3">
                <div className="p-4 border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-black block">ORDER #ord-178546123</span>
                    <span className="text-neutral-500">2 รายการ • ยอดรวม ฿8,580</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600 block">✓ จัดส่งแล้ว</span>
                    <Link href="/orders" className="text-[10px] text-black font-bold underline">ดูรายละเอียด</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Delivery Address */}
            <div className="bg-white border border-neutral-200 p-6 space-y-4">
              <h3 className="font-prompt font-black text-lg text-black uppercase pb-3 border-b border-neutral-200">
                ที่อยู่จัดส่งสินค้า (Saved Shipping Address)
              </h3>

              <div className="p-4 border border-neutral-200 bg-neutral-50 text-xs">
                <h4 className="font-bold text-black mb-1">{userName} ({phone})</h4>
                <p className="text-neutral-600 leading-relaxed">
                  99/9 อาคารสยามพารากอน ชั้น 2 ถนนพระราม 1 เขตปทุมวัน กรุงเทพมหานคร 10330
                </p>
              </div>
            </div>

          </div>

        </div>

      </main>

      <CtaFooter />
    </div>
  );
}
