"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("manager@tukshop.com");
  const [password, setPassword] = useState("manager123");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      // Validate Credentials
      if (email === "admin@tukshop.com" && password === "admin123") {
        localStorage.setItem("tuk_role", "ADMIN");
        localStorage.setItem("tuk_user", "คุณสมศักดิ์ (Admin)");
        router.push("/admin");
      } else if (email === "manager@tukshop.com" && password === "manager123") {
        localStorage.setItem("tuk_role", "MANAGER");
        localStorage.setItem("tuk_user", "คุณวิภาดา (Manager)");
        router.push("/admin");
      } else if (email === "staff@tukshop.com" && password === "staff123") {
        localStorage.setItem("tuk_role", "STAFF");
        localStorage.setItem("tuk_user", "คุณณัฐพล (Staff)");
        router.push("/admin");
      } else {
        setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง! กรุณาตรวจสอบอีกครั้ง");
        setLoading(false);
      }
    }, 600);
  };

  const quickFill = (rEmail: string, rPass: string) => {
    setEmail(rEmail);
    setPassword(rPass);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 font-prompt">
      <div className="bg-white border border-neutral-300 max-w-md w-full p-8 shadow-2xl relative font-prompt">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-black text-3xl tracking-tighter uppercase mb-2">
            TUK<span className="font-light tracking-widest text-neutral-500">SHOP</span>
          </Link>
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-black text-white px-3 py-1 block w-max mx-auto">
            ADMIN BACK-OFFICE LOGIN
          </span>
          <p className="font-kanit text-xs text-neutral-500 font-light mt-2">
            ระบบยืนยันตัวตนก่อนเข้าสู่หลังบ้านและการจัดการสินค้า
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-kanit font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-kanit text-xs">
          <div>
            <label className="font-bold text-black block mb-1">อีเมลผู้ใช้งาน (Email)</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-neutral-50 border border-neutral-300 text-xs text-black px-3 py-2.5 pl-9 focus:outline-none focus:border-black"
                placeholder="email@tukshop.com"
              />
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-black block mb-1">รหัสผ่าน (Password)</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-neutral-50 border border-neutral-300 text-xs text-black px-3 py-2.5 pl-9 focus:outline-none focus:border-black font-mono"
                placeholder="••••••••"
              />
              <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mt-6 shadow-md"
          >
            <span>{loading ? "กำลังตรวจสอบรหัส..." : "เข้าสู่ระบบหลังบ้าน"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Fill Buttons */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center font-kanit">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-3">
            ทดลองเข้าใช้งานรหัสตัวอย่าง:
          </span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => quickFill("manager@tukshop.com", "manager123")}
              className="bg-neutral-100 border border-neutral-300 text-[11px] font-bold text-black py-2 px-3 hover:bg-black hover:text-white transition-colors text-left flex justify-between items-center"
            >
              <span>👔 สิทธิ์ผู้จัดการ (Manager Login)</span>
              <span className="font-mono text-[9px] text-neutral-500">manager123</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill("admin@tukshop.com", "admin123")}
              className="bg-neutral-100 border border-neutral-300 text-[11px] font-bold text-black py-2 px-3 hover:bg-black hover:text-white transition-colors text-left flex justify-between items-center"
            >
              <span>👑 สิทธิ์ Admin (Admin Login)</span>
              <span className="font-mono text-[9px] text-neutral-500">admin123</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill("staff@tukshop.com", "staff123")}
              className="bg-neutral-100 border border-neutral-300 text-[11px] font-bold text-black py-2 px-3 hover:bg-black hover:text-white transition-colors text-left flex justify-between items-center"
            >
              <span>💼 สิทธิ์พนักงาน (Staff Login)</span>
              <span className="font-mono text-[9px] text-neutral-500">staff123</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
