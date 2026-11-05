import Link from "next/link";

export const metadata = { title: "เกี่ยวกับร้านทดลอง | TukShop", description: "TukShop ร้านกระเป๋าทดลองเพื่อเรียนรู้การทำร้านออนไลน์ เริ่มจากกระเป๋าผ้ายีนส์แฮนด์เมด 4 ใบ ไม่เปิดรับการซื้อขายจริง" };

export default function Page() {
  return (
    <main lang="th" className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-stone-900 px-6 py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm tracking-widest text-amber-200">TUKSHOP / เกี่ยวกับเรา</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">ร้านเล็ก ๆ<br />ที่กำลังเรียนรู้ไปทีละขั้น</h1>
          <p className="mt-6 max-w-2xl text-lg leading-loose text-stone-300">TukShop คือพื้นที่ทดลองทำร้านกระเป๋าออนไลน์ เริ่มต้นจากกระเป๋าผ้ายีนส์แฮนด์เมด 4 ใบ และความตั้งใจที่จะเรียนรู้ว่าร้านหนึ่งร้านควรเล่าเรื่องสินค้าให้เข้าใจได้อย่างไร</p>
        </div>
      </header>
      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12 md:py-16">
        <section className="grid gap-6 md:grid-cols-[1fr_2fr]" aria-labelledby="our-start">
          <h2 id="our-start" className="text-2xl font-semibold leading-relaxed">จากกระเป๋า 4 ใบ<br />สู่หน้าร้านที่ค่อย ๆ เป็นรูปเป็นร่าง</h2>
          <div className="space-y-4 text-base leading-loose text-stone-700 md:text-lg md:leading-loose"><p>เราใช้ร้านทดลองนี้เป็นพื้นที่เรียนรู้การนำเสนอรูปภาพ จัดหมวดหมู่ และเขียนรายละเอียดของกระเป๋าให้คนเลือกชมได้ง่ายขึ้น จุดเริ่มต้นจึงไม่ใช่เรื่องราวของธุรกิจใหญ่ แต่เป็นการลงมือสร้างร้านและปรับสิ่งเล็ก ๆ ให้ชัดขึ้นทีละส่วน</p><p>สิ่งที่เห็นบนเว็บไซต์คือส่วนหนึ่งของการทดลองนั้น ทั้งแคตตาล็อก หน้ารายละเอียด และขั้นตอนการใช้งาน เราอยากให้ผู้เข้าชมรู้ว่ากำลังดูอะไร และแยกออกว่าส่วนใดเป็นข้อมูลสินค้า ส่วนใดเป็นตัวอย่างระบบที่ยังไม่ได้ใช้ซื้อขายจริง</p></div>
        </section>
        <section aria-labelledby="our-principles" className="border-t border-stone-200 pt-10">
          <h2 id="our-principles" className="text-2xl font-semibold">สิ่งที่อยากทำให้ชัดตั้งแต่ต้น</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              ['เล่าเท่าที่รู้จริง', 'ใช้ภาพและรายละเอียดของแต่ละรายการเป็นหลัก ไม่เติมประวัติร้านหรือคำรับรองที่ยังไม่มีข้อมูลยืนยัน หากคุณสมบัติใดไม่ระบุ ไม่ควรถือว่ากระเป๋าทุกใบมีคุณสมบัตินั้นเหมือนกัน'],
              ['แยกการทดลองจากการขาย', 'ราคาเป็นราคาสาธิตสำหรับทดสอบหน้าร้านและการแสดงผล ไม่ใช่ข้อเสนอขาย เว็บไซต์ไม่เปิดรับการซื้อขายจริง จึงไม่ควรโอนเงินหรือส่งหลักฐานการชำระเงินเพื่อทดลองระบบ'],
              ['เรียนรู้จากการใช้งาน', 'ใช้พื้นที่นี้ฝึกจัดข้อมูลและออกแบบเส้นทางเลือกชมให้เข้าใจง่าย บทความเรื่องกระเป๋าเป็นอีกส่วนที่ช่วยให้ลองคิดเรื่องการเลือกใช้และการดูแล โดยไม่แทนคำแนะนำเฉพาะรุ่น'],
            ].map(([title, body], index) => <div key={title} className="rounded-2xl border border-stone-200 bg-white p-6"><p aria-hidden="true" className="text-sm text-amber-800">0{index + 1}</p><h3 className="mt-3 text-xl font-semibold">{title}</h3><p className="mt-4 leading-loose text-stone-600">{body}</p></div>)}
          </div>
        </section>
        <section aria-labelledby="demo-status" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <h2 id="demo-status" className="text-2xl font-semibold text-amber-950">สถานะปัจจุบัน: ร้านทดลอง</h2>
          <p className="mt-4 leading-loose text-amber-950">คุณสามารถเลือกชมกระเป๋าและอ่านเนื้อหาได้ แต่ยังไม่มีการเปิดขายจริง ข้อมูลการจัดส่ง การรับประกัน และช่องทางติดต่อจะต้องได้รับการยืนยันก่อนนำมาใช้เป็นเงื่อนไขบริการ เราไม่สร้างข้อมูลติดต่อขึ้นมาแทนช่องทางจริง</p>
          <Link href="/contact" className="mt-5 inline-block font-medium text-amber-950 underline underline-offset-4">ดูสถานะช่องทางติดต่อ →</Link>
        </section>
        <nav aria-label="สำรวจ TukShop" className="flex flex-wrap gap-4"><Link href="/products/category/all" className="rounded-full bg-stone-900 px-6 py-3 text-white">ชมกระเป๋าในร้านทดลอง</Link><Link href="/blog" className="rounded-full border border-stone-300 px-6 py-3">อ่านบันทึกเรื่องกระเป๋า</Link></nav>
      </div>
    </main>
  );
}
