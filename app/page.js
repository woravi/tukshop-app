"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatTHB } from "@/lib/currency.mjs";
import ShopHero from "@/components/HomepageComponents/HeroVideo";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products/allProducts?page=1&limit=4", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("catalogue unavailable"); return response.json(); })
      .then((data) => { if (!Array.isArray(data.products)) throw new Error("invalid catalogue"); setProducts(data.products); setStatus("ready"); })
      .catch((error) => { if (error.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, []);
  return (
    <main className="bg-stone-50 text-stone-900">
      <div role="note" className="border-y border-[#dfd4c4] bg-[#f8f2e8] px-5 py-3 text-center text-sm leading-6 text-[#66543c]">เว็บไซต์สาธิต · ราคาที่แสดงเป็นราคาตัวอย่าง · ยังไม่เปิดรับคำสั่งซื้อหรือชำระเงินจริง</div>
      <ShopHero />
      <section id="catalogue" className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm tracking-widest text-stone-500">TUKSHOP COLLECTION</p><h2 className="mt-2 text-3xl font-bold">กระเป๋าของเรา</h2></div><Link href="/products/category/all" className="underline underline-offset-4">ดูสินค้าทั้งหมด</Link></div>
        {status === "loading" && <p role="status">กำลังโหลดสินค้า...</p>}
        {status === "error" && <p role="alert">ไม่สามารถโหลดสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</p>}
        {status === "ready" && products.length === 0 && <p>ยังไม่มีสินค้าในขณะนี้</p>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <Link key={product._id} href={`/product/${product._id}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
            <div className="aspect-square overflow-hidden bg-stone-100"><Image src={product.images?.[0] || "/product-placeholder.svg"} alt={product.name} width={600} height={600} className="h-full w-full object-cover transition-transform group-hover:scale-105" /></div>
            <div className="p-5"><h3 className="font-semibold">{product.name}</h3><p className="mt-2 text-stone-600">{formatTHB(product.price)}</p></div>
          </Link>)}
        </div>
      </section>
    </main>
  );
}
