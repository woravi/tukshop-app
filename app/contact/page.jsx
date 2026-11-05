import Link from "next/link";

export const metadata = { title: "ติดต่อเรา · เบอร์ร้านและแอดมิน | TukShop", description: "ติดต่อร้าน TukShop 0816965575 หรือแอดมิน 0955456533 ร้านทดลองที่ยังไม่เปิดขายจริง ส่วนอีเมล LINE ที่อยู่ และเวลาติดต่อยังรอยืนยัน" };

export default function Page() {
  return (
    <main lang="th" className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-stone-900 px-6 py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm tracking-widest text-amber-200">TUKSHOP / ติดต่อเรา</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">ข้อมูลที่ชัดเจน<br />เริ่มจากช่องทางที่ยืนยันแล้ว</h1>
          <p className="mt-6 max-w-2xl text-lg leading-loose text-stone-300">TukShop ยังเป็นร้านทดลอง สามารถติดต่อร้านหรือแอดมินทางหมายเลขที่เจ้าของร้านให้ไว้ด้านล่าง ส่วนอีเมล LINE ที่อยู่ และเวลาติดต่อยังรอยืนยัน โดยไม่แสดงข้อมูลตัวอย่างที่อาจทำให้เข้าใจผิด</p>
        </div>
      </header>
      <div className="mx-auto max-w-5xl space-y-10 px-6 py-12 md:py-16">
        <section aria-labelledby="contact-status" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-950">สถานะ: ร้านทดลอง · มีเบอร์ติดต่อร้านและแอดมิน</p>
          <h2 id="contact-status" className="text-2xl font-semibold text-amber-950">ยังไม่เปิดรับข้อความผ่านเว็บไซต์</h2>
          <p className="mt-4 leading-loose text-amber-950">หน้านี้เป็นหน้าข้อมูล ไม่ใช่แบบฟอร์มส่งข้อความ และยังไม่มีทีมรับเรื่องผ่านระบบเว็บไซต์ ไม่ต้องส่งข้อมูลส่วนตัว เอกสาร บัญชีธนาคาร หรือหลักฐานการโอนเงินเพื่อทดลองใช้งาน ร้านไม่เปิดรับการซื้อขายจริงและราคาแสดงเพื่อสาธิตเท่านั้น</p>
        </section>
        <section aria-labelledby="channels">
          <h2 id="channels" className="text-2xl font-semibold">เบอร์โทรติดต่อร้านและแอดมิน</h2>
          <p className="mt-3 leading-loose text-stone-600">กดหมายเลขเพื่อโทรติดต่อร้านหรือแอดมินได้ตามข้อมูลที่เจ้าของร้านให้ไว้ ช่องทางอื่นและเวลาติดต่อจะแสดงเมื่อได้รับการยืนยันเท่านั้น</p>
          <dl className="mt-6 divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {[
              ['ติดต่อร้าน', <a href="tel:0816965575" className="rounded-sm font-medium text-stone-900 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">0816965575</a>],
              ['แอดมิน', <a href="tel:0955456533" className="rounded-sm font-medium text-stone-900 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">0955456533</a>],
              ['อีเมล', 'รอยืนยันอีเมลสำหรับติดต่อร้าน'],
              ['LINE / โซเชียล', 'รอยืนยันบัญชีหรือลิงก์ทางการ'],
              ['ที่อยู่', 'รอยืนยันว่ามีที่อยู่สำหรับติดต่อหรือจุดรับสินค้าหรือไม่'],
              ['เวลาติดต่อ', 'รอยืนยันวัน เวลา และเขตเวลาที่สามารถติดต่อได้'],
            ].map(([label, value]) => <div key={label} className="grid gap-2 px-6 py-5 sm:grid-cols-[10rem_1fr]"><dt className="font-semibold">{label}</dt><dd className="leading-relaxed text-stone-600">{value}</dd></div>)}
          </dl>
        </section>
        <section aria-labelledby="prepare-questions" className="grid gap-6 border-t border-stone-200 pt-10 md:grid-cols-[1fr_2fr]">
          <h2 id="prepare-questions" className="text-2xl font-semibold leading-relaxed">มีข้อสงสัยเรื่องกระเป๋า?<br />เก็บประเด็นไว้ก่อนได้</h2>
          <div className="space-y-4 leading-loose text-stone-700"><p>เมื่อติดต่อร้านหรือแอดมิน ชื่อสินค้าหรือลิงก์หน้าสินค้าจะช่วยให้สอบถามได้ตรงรุ่น โดยไม่จำเป็นต้องให้ข้อมูลส่วนตัวตั้งแต่เริ่มต้น คุณอาจเตรียมคำถามเหล่านี้ไว้ก่อน:</p><ul className="list-disc space-y-2 pl-5"><li>ขนาด ความยาวสาย และรูปแบบช่องเก็บของของรุ่นที่สนใจ</li><li>วัสดุด้านนอก ซับใน และวิธีดูแลเฉพาะรุ่น</li><li>ข้อมูลใดบนหน้าสินค้ายังไม่ครบหรืออ่านแล้วไม่ชัดเจน</li><li>ข้อเสนอแนะเกี่ยวกับการเลือกชมและการใช้งานเว็บไซต์ทดลอง</li></ul><p className="text-sm text-stone-500">ยังไม่มีการรับคำสั่งซื้อ การจอง หรือการนัดหมายผ่านหน้านี้ และยังไม่สามารถระบุระยะเวลาตอบกลับได้</p></div>
        </section>
        <nav aria-label="ข้อมูลเพิ่มเติมเกี่ยวกับร้านทดลอง" className="rounded-2xl bg-stone-200 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">ระหว่างนี้ ลองสำรวจเรื่องที่สนใจ</h2>
          <p className="mt-3 leading-loose text-stone-700">อ่านที่มาของร้านทดลองและบทความเรื่องกระเป๋า หรือกลับไปดูภาพกับรายละเอียดในแคตตาล็อกได้โดยไม่ต้องส่งข้อความ</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/about" className="rounded-full bg-white px-5 py-3">เกี่ยวกับ TukShop</Link><Link href="/blog" className="rounded-full bg-white px-5 py-3">อ่านบทความ</Link><Link href="/products/category/all" className="rounded-full bg-stone-900 px-5 py-3 text-white">ชมกระเป๋าในร้านทดลอง</Link></div>
        </nav>
      </div>
    </main>
  );
}
