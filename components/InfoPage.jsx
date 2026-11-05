import Link from "next/link";

export default function InfoPage({ title, intro, children }) {
  return <main className="min-h-[60vh] bg-stone-50 text-stone-900"><header className="bg-stone-900 px-6 py-16 text-white"><div className="mx-auto max-w-3xl"><h1 className="text-3xl font-bold md:text-5xl">{title}</h1>{intro && <p className="mt-4 text-lg text-stone-300">{intro}</p>}</div></header><div className="mx-auto max-w-3xl space-y-6 px-6 py-12 leading-relaxed">{children}<Link href="/products/category/all" className="inline-block rounded-full bg-stone-900 px-6 py-3 text-white">ดูสินค้าทั้งหมด</Link></div></main>;
}
