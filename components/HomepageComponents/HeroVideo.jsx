import Link from "next/link";
import { motion } from "framer-motion";

// The template's externally hosted watch video was intentionally removed.
// Product photos are served from the shop's own image endpoint instead.
export default function ShopHero() {
  return (
    <section className="relative flex min-h-[34rem] w-full items-center justify-center overflow-hidden bg-stone-900 px-6 text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%)]" aria-hidden="true" />
      <div className="relative z-10 max-w-2xl">
        <motion.h1
          className="mb-5 text-4xl font-bold md:text-6xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ยินดีต้อนรับสู่ TukShop
        </motion.h1>
        <p className="mb-8 text-lg text-stone-200 md:text-xl">
          เลือกชมสินค้าในแบบที่เป็นคุณ
        </p>
        <Link href="/products" className="inline-flex min-h-12 items-center rounded-full bg-white px-7 py-3 font-semibold text-stone-900 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          ดูสินค้าทั้งหมด
        </Link>
      </div>
    </section>
  );
}
