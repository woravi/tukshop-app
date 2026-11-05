import Link from "next/link";

export default function GuaranteeSection() {
  return (
    <section className="mt-8 rounded-xl bg-stone-100 px-6 py-10">
      <h2 className="text-2xl font-bold text-stone-900">ข้อมูลก่อนสั่งซื้อสินค้า</h2>
      <p className="mt-4 text-stone-700">กรุณาตรวจสอบเงื่อนไขที่เกี่ยวข้องและสอบถามร้านเพื่อยืนยันรายละเอียดก่อนชำระเงิน</p>
      <nav aria-label="ข้อมูลการสั่งซื้อ" className="mt-6 flex flex-wrap gap-6">
        <Link href="/shipping-returns" className="underline underline-offset-4">การจัดส่งและคืนสินค้า</Link>
        <Link href="/warranty" className="underline underline-offset-4">เงื่อนไขการรับประกัน</Link>
        <Link href="/contact" className="underline underline-offset-4">ติดต่อร้าน</Link>
      </nav>
    </section>
  );
}
