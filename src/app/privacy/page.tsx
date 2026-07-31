import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";

export const metadata = {
  title: "นโยบายความเป็นส่วนตัว | TukShop",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-8 pt-24 pb-20 font-kanit text-sm text-neutral-700 leading-relaxed">
        <h1 className="font-prompt font-black text-2xl sm:text-3xl uppercase mb-2 text-black">
          นโยบายความเป็นส่วนตัว (Privacy Policy)
        </h1>
        <p className="text-xs text-neutral-400 mb-10">ปรับปรุงล่าสุด: 31 กรกฎาคม 2569</p>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">1. ข้อมูลที่เราเก็บรวบรวม</h2>
          <p className="mb-2">เมื่อคุณสมัครสมาชิกหรือเข้าสู่ระบบ TukShop เราจะเก็บข้อมูลดังนี้:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์ (กรณีสมัครด้วยอีเมล/รหัสผ่าน)</li>
            <li>ชื่อ, อีเมล และรหัสประจำตัวบัญชี (Account ID) จากผู้ให้บริการที่คุณเลือกเข้าสู่ระบบ (LINE, Facebook หรือ Google) — เราจะเห็นเฉพาะข้อมูลที่คุณอนุญาตให้เข้าถึงเท่านั้น</li>
            <li>ประวัติคำสั่งซื้อและที่อยู่จัดส่ง เมื่อคุณสั่งซื้อสินค้า</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">2. รหัสผ่านของคุณ</h2>
          <p>
            กรณีสมัครสมาชิกด้วยอีเมล/รหัสผ่าน เราจะไม่เก็บรหัสผ่านของคุณในรูปแบบข้อความธรรมดา
            (plain text) ระบบจะเข้ารหัส (hash) รหัสผ่านก่อนบันทึกทุกครั้ง แม้แต่ทีมงานของเราก็ไม่สามารถ
            มองเห็นรหัสผ่านจริงของคุณได้
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">3. เราใช้ข้อมูลของคุณอย่างไร</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>สร้างและดูแลบัญชีสมาชิกของคุณ</li>
            <li>ดำเนินการคำสั่งซื้อและจัดส่งสินค้า</li>
            <li>คำนวณและมอบสิทธิประโยชน์คะแนนสะสม JPS Club</li>
            <li>ติดต่อสื่อสารเกี่ยวกับคำสั่งซื้อหรือโปรโมชัน (กรณีคุณยินยอม)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">4. การเปิดเผยข้อมูล</h2>
          <p>
            เราไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลภายนอก ข้อมูลจะถูกเปิดเผยเฉพาะเท่าที่จำเป็น
            สำหรับการจัดส่งสินค้า (เช่น บริษัทขนส่ง) หรือเมื่อกฎหมายกำหนดเท่านั้น
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">5. คุกกี้ (Cookies)</h2>
          <p>
            เว็บไซต์ของเราใช้คุกกี้เพื่อจดจำการเข้าสู่ระบบและปรับปรุงประสบการณ์การใช้งาน
            คุณสามารถตั้งค่าการยอมรับคุกกี้ได้ผ่านแบนเนอร์ที่ปรากฏบนหน้าเว็บ
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">6. สิทธิของคุณ</h2>
          <p>
            คุณสามารถขอเข้าถึง แก้ไข หรือขอให้ลบข้อมูลส่วนบุคคลของคุณออกจากระบบได้ตลอดเวลา
            โดยติดต่อเราตามช่องทางด้านล่าง
          </p>
        </section>

        <section>
          <h2 className="font-prompt font-bold text-lg text-black mb-2">7. ติดต่อเรา</h2>
          <p>
            หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ ติดต่อได้ที่{" "}
            <a href="mailto:support@tukshop.ratchavit.com" className="text-black font-bold underline">
              support@tukshop.ratchavit.com
            </a>
          </p>
        </section>
      </main>

      <CtaFooter />
    </div>
  );
}
