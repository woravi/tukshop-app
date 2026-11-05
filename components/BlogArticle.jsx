import Link from "next/link";
import { BLOG_ARTICLES } from "@/lib/blog-articles.mjs";

export default function BlogArticle({ slug }) {
  const article = BLOG_ARTICLES.find(item => item.slug === slug);
  return (
    <main lang="th" className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-stone-900 px-6 py-14 text-white md:py-20">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="rounded-sm text-sm text-stone-300 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">← บทความทั้งหมด</Link>
          <p className="mt-10 text-sm font-medium text-amber-200">{article.category} / TUKSHOP JOURNAL {article.number}</p>
          <h1 className="mt-4 text-3xl font-semibold leading-relaxed md:text-5xl md:leading-snug">{article.title}</h1>
          <p className="mt-6 text-lg leading-loose text-stone-300">{article.excerpt}</p>
          <p className="mt-6 text-sm text-stone-400">เรียบเรียงสำหรับร้านทดลอง TukShop · แนวทางทั่วไป ไม่ใช่ข้อมูลเฉพาะรุ่น</p>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <aside className="mb-12 border-l-4 border-amber-700 bg-amber-50 p-6 text-lg leading-loose text-amber-950"><strong className="mb-2 block text-sm">เก็บประเด็นนี้ไว้</strong>{article.takeaway}</aside>
        <div className="space-y-12">
          {article.sections.map((section, index) => (
            <section key={section.title} aria-labelledby={`section-${index}`}>
              <h2 id={`section-${index}`} className="mb-5 text-2xl font-semibold leading-relaxed"><span aria-hidden="true" className="mr-3 text-amber-800">0{index + 1}</span>{section.title}</h2>
              {section.paragraphs.map(paragraph => <p key={paragraph} className="mt-4 text-base leading-loose text-stone-700 md:text-lg md:leading-loose">{paragraph}</p>)}
            </section>
          ))}
        </div>
        <aside className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 text-sm leading-loose text-stone-600"><strong className="text-stone-900">เกี่ยวกับข้อมูลในบทความ</strong><p className="mt-2">เนื้อหานี้เป็นข้อเสนอแนะทั่วไป โปรดตรวจรายละเอียดและคำแนะนำของสินค้าจริงเป็นรายรุ่น TukShop ยังเป็นร้านทดลอง ราคาใช้เพื่อสาธิตและไม่เปิดรับการซื้อขายจริง</p><Link href="/contact" className="mt-3 inline-block underline underline-offset-4">ตรวจสถานะช่องทางติดต่อ</Link></aside>
        <nav aria-label="อ่านต่อ" className="mt-12 border-t border-stone-200 pt-8">
          <h2 className="text-xl font-semibold">เรื่องอื่นที่อาจเป็นประโยชน์</h2>
          <ul className="mt-4 space-y-4">{BLOG_ARTICLES.filter(item => item.slug !== slug).map(item => <li key={item.slug}><Link href={`/blog/${item.slug}`} className="leading-loose underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900">{item.title} →</Link></li>)}</ul>
          <div className="mt-8 flex flex-wrap gap-4"><Link href="/blog" className="rounded-full border border-stone-300 px-6 py-3">บทความทั้งหมด</Link><Link href="/products/category/all" className="rounded-full bg-stone-900 px-6 py-3 text-white">ชมกระเป๋าในร้านทดลอง</Link></div>
        </nav>
      </article>
    </main>
  );
}
