import Link from "next/link";

export default function FeaturesSection() {
  return (
    <section className="mt-10 rounded-xl bg-stone-100 px-6 py-10">
      <h2 className="text-2xl font-bold text-stone-900">เลือกกระเป๋าให้เหมาะกับคุณ</h2>
      <p className="mt-4 text-stone-700">ดูรูปภาพและรายละเอียดของสินค้าแต่ละรุ่น หากต้องการข้อมูลวัสดุ ขนาด หรือการดูแลเพิ่มเติม กรุณาสอบถามร้านก่อนสั่งซื้อ</p>
      <div className="mt-6 flex flex-wrap gap-6">
        <Link href="/products/category/all" className="underline underline-offset-4">ดูสินค้าทั้งหมด</Link>
        <Link href="/contact" className="underline underline-offset-4">สอบถามรายละเอียดสินค้า</Link>
      </div>
    </section>
  );
}
