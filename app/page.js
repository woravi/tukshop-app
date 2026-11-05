"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatTHB } from "@/lib/currency.mjs";
import ShopHero from "@/components/HomepageComponents/HeroVideo";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [foodPhoto, setFoodPhoto] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/food/menu", { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("menu unavailable"); return r.json(); })
      .then(data => setFoodPhoto((data.items || []).find(item => item.source_type === "made_to_order" && /^\/api\/images\/[1-9]\d*$/.test(item.image_url || "")) || null))
      .catch(() => {});
    return () => controller.abort();
  }, []);
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
      <div role="note" className="border-y border-[#dfd4c4] bg-[#f8f2e8] px-5 py-3 text-center text-sm leading-6 text-[#66543c]">เฉพาะสินค้าที่ติดป้ายตัวอย่าง ราคาที่แสดงเป็นราคาตัวอย่าง · ร้านสินค้ายังไม่เปิดชำระเงินออนไลน์ · ร้านอาหารตรวจสถานะรับออร์เดอร์ได้ที่ครัวรัชนี</div>
      <div className="mx-auto max-w-7xl px-5 pb-5 pt-9"><p className="text-xs font-semibold tracking-widest text-stone-500">ยินดีต้อนรับสู่ TukShop</p><p className="mt-2 text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl">ของที่ชอบ กับมื้อที่ใช่</p></div>
      <nav aria-label="เลือกร้าน" className="mx-auto grid max-w-7xl gap-5 px-5 pb-10 md:grid-cols-2">
        <Link href="/products/category/all" className="group relative isolate flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[28px] border border-[#e2d7c7] bg-[#eee7da] p-7 transition hover:border-stone-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-800 sm:p-9">
          {products[0]?.images?.[0] && <Image src={products[0].images[0]} alt="" width={500} height={500} className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-1/2 object-cover opacity-35 [mask-image:linear-gradient(to_right,transparent,black)]" />}
          <div><p className="text-xs font-semibold tracking-widest text-stone-500">TUKSHOP COLLECTION</p><h2 className="mt-3 text-3xl font-bold text-[#443c31] sm:text-4xl">ร้านสินค้า</h2><p className="mt-3 max-w-[220px] text-base leading-7 text-stone-600">กระเป๋าใบที่ชอบ<br/>เลือกชมแบบและรายละเอียดได้ที่นี่</p></div>
          <span className="mt-7 inline-flex min-h-11 items-center gap-3 self-start rounded-full bg-white/80 px-5 py-2.5 font-semibold text-stone-800 transition group-hover:bg-white">เข้าร้านสินค้า <span aria-hidden="true">→</span></span>
        </Link>
        <Link href="/food" className="group relative isolate flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#203f32] p-7 text-[#fff9ed] transition hover:bg-[#294e3c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800 sm:p-9">
          {foodPhoto && <><Image src={foodPhoto.image_url} alt={`ภาพประกอบเมนู ${foodPhoto.name}`} width={600} height={600} className="pointer-events-none absolute inset-y-0 right-0 -z-20 h-full w-3/5 object-cover" /><div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,#203f32_22%,rgba(32,63,50,0.82)_48%,rgba(32,63,50,0.08)_100%)]" /></>}
          <div><p className="text-xs font-semibold tracking-widest text-[#e5bd81]">ร้านอาหารของเรา</p><h2 className="mt-3 text-4xl font-bold sm:text-5xl">ครัวรัชนี</h2><p className="mt-3 max-w-[250px] text-base leading-7 text-[#f2e8d6]">อาหารตามสั่ง · อาหารกล่อง · ขนม<br/>เลือกมื้อที่ใช่ แล้วให้ครัวเราดูแล</p></div>
          <span className="mt-7 inline-flex min-h-11 items-center gap-3 self-start rounded-full bg-[#f2d49e] px-5 py-2.5 font-semibold text-[#203f32] transition group-hover:bg-[#ffe3b1]">ดูเมนูและสั่งอาหาร <span aria-hidden="true">→</span></span>
        </Link>
      </nav>
      <ShopHero />
      <section id="catalogue" className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm tracking-widest text-stone-500">TUKSHOP COLLECTION</p><h2 className="mt-2 text-3xl font-bold">กระเป๋าของเรา</h2></div><Link href="/products/category/all" className="underline underline-offset-4">ดูสินค้าทั้งหมด</Link></div>
        {status === "loading" && <p role="status">กำลังโหลดสินค้า...</p>}
        {status === "error" && <p role="alert">ไม่สามารถโหลดสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</p>}
        {status === "ready" && products.length === 0 && <p>ยังไม่มีสินค้าในขณะนี้</p>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <Link key={product._id} href={`/product/${product._id}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
            <div className="aspect-square overflow-hidden bg-stone-100"><Image src={product.images?.[0] || "/product-placeholder.svg"} alt={product.name} width={600} height={600} className="h-full w-full object-cover transition-transform group-hover:scale-105" /></div>
            <div className="p-5">{product.is_demo && <span className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">สินค้าตัวอย่าง · ไม่จำหน่าย</span>}<h3 className="font-semibold">{product.name}</h3><p className="mt-2 text-stone-600">{formatTHB(product.price)}</p></div>
          </Link>)}
        </div>
      </section>
    </main>
  );
}
