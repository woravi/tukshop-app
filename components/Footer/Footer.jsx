import Link from "next/link";

export default function Footer() {
  const links = [["สินค้า", "/products/category/all"], ["เกี่ยวกับร้าน", "/about"], ["บทความ", "/blog"], ["ติดต่อเรา", "/contact"], ["คำถามที่พบบ่อย", "/faq"], ["การจัดส่งและคืนสินค้า", "/shipping-returns"], ["การรับประกัน", "/warranty"], ["ความเป็นส่วนตัว", "/privacy-policy"]];
  return <footer className="bg-stone-900 text-stone-200"><div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-2"><div><Link href="/" className="text-2xl font-bold text-white">TukShop</Link><p className="mt-3 text-stone-400">เลือกชมกระเป๋าและรายละเอียดสินค้าได้ที่ร้านของเรา</p></div><nav aria-label="ลิงก์ส่วนท้าย"><ul className="grid grid-cols-2 gap-3">{links.map(([label, href]) => <li key={href}><Link className="hover:text-white" href={href}>{label}</Link></li>)}</ul></nav></div></footer>;
}
