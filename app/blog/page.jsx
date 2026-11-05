import Link from "next/link";
import { BLOG_ARTICLES } from "@/lib/blog-articles.mjs";

export const metadata = { title: "บทความเรื่องกระเป๋า | TukShop", description: "ไอเดียเลือกกระเป๋า จัดของใช้ประจำวัน และตรวจสอบวิธีดูแล จากร้านทดลอง TukShop" };

export default function Page() {
  return (
    <main lang="th" className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-stone-900 px-6 py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm tracking-widest text-amber-200">TUKSHOP / บันทึกเรื่องกระเป๋า</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">กระเป๋าหนึ่งใบ<br />กับเรื่องเล็ก ๆ ในทุกวัน</h1>
          <p className="mt-6 max-w-2xl text-lg leading-loose text-stone-300">เลือกให้เข้ากับสิ่งที่พก จัดให้หยิบง่าย และรู้จักรายละเอียดก่อนดูแล บทความต้นฉบับภาษาไทยสำหรับค่อย ๆ ทำความรู้จักกระเป๋าที่ใช้ในชีวิตประจำวัน</p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">อ่านทีละเรื่อง ใช้ได้ทีละวัน</h2>
          <span className="text-sm text-stone-600">3 เรื่องจาก TukShop</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {BLOG_ARTICLES.map(article => (
            <article key={article.slug} className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <div aria-hidden="true" className="flex h-36 items-end justify-between bg-stone-200 p-6 text-stone-700"><span className="text-sm tracking-widest">TUKSHOP JOURNAL</span><span className="text-6xl font-light">{article.number}</span></div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-sm font-medium text-amber-800">{article.category}</p>
                <h3 className="mt-3 text-2xl font-semibold leading-relaxed"><Link href={`/blog/${article.slug}`} className="rounded-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{article.title}</Link></h3>
                <p className="mb-6 mt-4 leading-loose text-stone-600">{article.excerpt}</p>
                <Link href={`/blog/${article.slug}`} aria-label={`อ่านบทความ: ${article.title}`} className="mt-auto inline-flex w-fit items-center gap-3 rounded-full border border-stone-300 px-5 py-2 text-sm font-medium hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">อ่านเรื่องนี้ <span aria-hidden="true">→</span></Link>
              </div>
            </article>
          ))}
        </div>
        <aside className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-loose text-amber-950"><strong>อ่านก่อนเลือกชม</strong><p className="mt-1">TukShop เป็นร้านทดลองเพื่อเรียนรู้การทำร้านออนไลน์ ราคาและขั้นตอนบนเว็บไซต์ใช้เพื่อสาธิต ไม่เปิดรับการซื้อขายจริง บทความเป็นแนวทางทั่วไป ไม่ใช่คำรับรองคุณสมบัติของสินค้ารุ่นใด</p></aside>
        <Link href="/products/category/all" className="mt-8 inline-block rounded-full bg-stone-900 px-6 py-3 text-white">ชมกระเป๋าในร้านทดลอง</Link>
      </div>
    </main>
  );
}
