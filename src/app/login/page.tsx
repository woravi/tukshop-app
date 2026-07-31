"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X, ArrowRight, User, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";

function CustomerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");

  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setMode("register");
    }
  }, [searchParams]);

  // Form Data States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Cookie Consent
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [isCookieAccepted, setIsCookieAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (mode === "login") {
        localStorage.setItem("tuk_customer_user", email || "คุณอนันต์ ชัยเจริญ");
        setStatusToast("เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับกลับสู่ TukShop");
        setTimeout(() => router.push("/"), 1200);
      } else {
        localStorage.setItem("tuk_customer_user", `${firstName} ${lastName}`);
        setStatusToast("สร้างบัญชีผู้ใช้ใหม่สำเร็จ! ได้รับส่วนลด 10% (โค้ด: WELCOME10)");
        setTimeout(() => router.push("/"), 1500);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white text-black font-prompt flex flex-col justify-between">
      <Navbar />

      {/* Toast Alert */}
      <AnimatePresence>
        {statusToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-black text-white px-6 py-3 border border-neutral-700 font-kanit text-xs font-semibold flex items-center gap-2 shadow-xl"
          >
            <Check className="w-4 h-4 text-green-400" />
            <span>{statusToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 1:1 theStudiofour Auth Card Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-32 pb-20 flex flex-col justify-center">
        
        {/* Title */}
        <h1 className="font-prompt font-black text-2xl text-center text-black uppercase mb-6 tracking-wide">
          {mode === "login" ? "เข้าสู่ระบบ" : "ลงทะเบียน"}
        </h1>

        {/* Social Media Login Buttons (LINE, Facebook, Google) */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* LINE Button */}
          <button
            onClick={() => {
              setStatusToast("เชื่อมต่อเข้าสู่ระบบด้วย LINE สำเร็จ");
              setTimeout(() => router.push("/"), 1000);
            }}
            className="w-10 h-10 rounded-full bg-[#00B900] flex items-center justify-center hover:opacity-90 transition-opacity shadow-xs"
            title="เข้าสู่ระบบด้วย LINE"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </button>

          {/* Facebook Button */}
          <button
            onClick={() => {
              setStatusToast("เชื่อมต่อเข้าสู่ระบบด้วย Facebook สำเร็จ");
              setTimeout(() => router.push("/"), 1000);
            }}
            className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-90 transition-opacity shadow-xs"
            title="เข้าสู่ระบบด้วย Facebook"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>

          {/* Google Button */}
          <button
            onClick={() => {
              setStatusToast("เชื่อมต่อเข้าสู่ระบบด้วย Google สำเร็จ");
              setTimeout(() => router.push("/"), 1000);
            }}
            className="w-10 h-10 rounded-full bg-white border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-xs"
            title="เข้าสู่ระบบด้วย Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </button>
        </div>

        {/* Divider Line */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-neutral-200 w-full" />
          <span className="bg-white px-3 font-kanit text-xs text-neutral-400 font-light">หรือ</span>
          <div className="border-t border-neutral-200 w-full" />
        </div>

        {/* Subtitle Message */}
        <p className="font-kanit text-xs text-neutral-500 text-center font-light mb-6">
          {mode === "login" 
            ? "กรุณาใส่อีเมลและรหัสผ่านของคุณเพื่อลงชื่อเข้าใช้:" 
            : "กรุณากรอกข้อมูลส่วนตัวของคุณเพื่อลงทะเบียนสมาชิกใหม่รับส่วนลด 10%:"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-kanit text-xs">
          
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="ชื่อ"
                  className="w-full bg-white border border-neutral-300 text-xs text-black px-3 py-3 focus:outline-none focus:border-black font-kanit"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="นามสกุล"
                  className="w-full bg-white border border-neutral-300 text-xs text-black px-3 py-3 focus:outline-none focus:border-black font-kanit"
                />
              </div>
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="อีเมล"
              className="w-full bg-white border border-neutral-300 text-xs text-black px-3 py-3 focus:outline-none focus:border-black font-kanit"
            />
          </div>

          {mode === "register" && (
            <div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="เบอร์โทรศัพท์ (เช่น 081-234-5678)"
                className="w-full bg-white border border-neutral-300 text-xs text-black px-3 py-3 focus:outline-none focus:border-black font-mono"
              />
            </div>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="รหัสผ่าน"
              className="w-full bg-white border border-neutral-300 text-xs text-black px-3 py-3 focus:outline-none focus:border-black font-kanit pr-32"
            />
            {mode === "login" && (
              <button
                type="button"
                onClick={() => setStatusToast("ระบบได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อย")}
                className="absolute right-3 top-3 text-[10px] text-neutral-400 hover:text-black font-kanit underline"
              >
                ลืมรหัสผ่านหรือเปล่า?
              </button>
            )}
          </div>

          {/* Full-width Solid Black Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors font-prompt mt-2"
          >
            {isSubmitting 
              ? "กำลังดำเนินการ..." 
              : mode === "login" ? "เข้าสู่ระบบ" : "ลงทะเบียน"}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="text-center mt-6">
          {mode === "login" ? (
            <p className="font-kanit text-xs text-neutral-500">
              ยังไม่มีบัญชีใช่ไหม?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-black font-bold underline ml-1 hover:opacity-80"
              >
                ลงชื่อ
              </button>
            </p>
          ) : (
            <p className="font-kanit text-xs text-neutral-500">
              มีบัญชีอยู่แล้วใช่ไหม?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-black font-bold underline ml-1 hover:opacity-80"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          )}
        </div>

      </main>

      <CtaFooter />

      {/* studiofour Style Fixed Cookie Consent Banner */}
      {!isCookieAccepted && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 inset-x-0 z-40 bg-black text-white px-4 py-3 border-t border-neutral-800 font-kanit text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl"
        >
          <p className="text-[11px] font-light text-neutral-300 text-center sm:text-left max-w-4xl leading-relaxed">
            This website uses cookies. Please accept our cookie policy for your best experience. You can learn more on how to adjust your cookie setting in our cookie policy{" "}
            <a href="#" className="underline font-semibold text-white">Privacy Policy</a>
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCookieAccepted(true)}
              className="px-3 py-1.5 border border-white text-white text-[10px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Preferences
            </button>
            <button
              onClick={() => setIsCookieAccepted(true)}
              className="px-4 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function CustomerAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CustomerAuthContent />
    </Suspense>
  );
}
