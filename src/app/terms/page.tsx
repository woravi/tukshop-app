import Navbar from "@/components/Navbar";
import CtaFooter from "@/components/CtaFooter";

export const metadata = {
  title: "ข้อกำหนดการใช้งาน | TukShop",
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-white text-black font-prompt">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-8 pt-24 pb-20 font-kanit text-sm text-neutral-700 leading-relaxed">
        <h1 className="font-prompt font-black text-2xl sm:text-3xl uppercase mb-2 text-black">
          ข้อกำหนดการใช้งาน (Terms of Use)
        </h1>
        <p className="text-xs text-neutral-400 mb-10">ปรับปรุงล่าสุด: 31 กรกฎาคม 2569</p>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">1. การยอมรับข้อกำหนด</h2>
          <p>
            การสมัครสมาชิกหรือใช้งานเว็บไซต์ TukShop ถือว่าคุณยอมรับข้อกำหนดการใช้งานฉบับนี้
            และนโยบายความเป็นส่วนตัวของเรา หากไม่ยอมรับ กรุณางดใช้บริการ
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">2. บัญชีสมาชิก</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>คุณต้องให้ข้อมูลที่ถูกต้องและเป็นความจริงในการสมัครสมาชิก</li>
            <li>คุณมีหน้าที่รักษาความปลอดภัยของรหัสผ่านและบัญชีของคุณเอง</li>
            <li>บัญชีหนึ่งใช้สำหรับเจ้าของอีเมล/บัญชีโซเชียลนั้นเพียงคนเดียวเท่านั้น</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">3. การสั่งซื้อและการชำระเงิน</h2>
          <p>
            เรารองรับการชำระเงินผ่าน PromptPay QR Code และบัตรเครดิต/เดบิต คำสั่งซื้อจะได้รับการยืนยัน
            หลังจากตรวจสอบการชำระเงินสำเร็จ ราคาสินค้าที่แสดงอาจมีการเปลี่ยนแปลงได้โดยไม่ต้องแจ้งล่วงหน้า
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">4. การจัดส่งและการคืนสินค้า</h2>
          <p>
            จัดส่งฟรีทั่วประเทศทุกออเดอร์ ระยะเวลาจัดส่งโดยประมาณ 1-3 วันทำการ
            สามารถเปลี่ยนไซส์หรือคืนสินค้าได้ภายใน 7 วันทำการนับจากวันที่ได้รับพัสดุ
            โดยสินค้าต้องอยู่ในสภาพสมบูรณ์ ไม่ผ่านการซัก และมีป้ายสินค้าครบถ้วน
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">5. คะแนนสะสม JPS Club</h2>
          <p>
            คะแนนสะสมไม่สามารถแลกหรือโอนเป็นเงินสดได้ และอาจถูกยกเลิกหากตรวจพบการใช้งานที่ผิดเงื่อนไข
            เราขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโปรแกรมคะแนนสะสมได้ตลอดเวลา
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">6. ข้อจำกัดความรับผิด</h2>
          <p>
            เราพยายามให้ข้อมูลสินค้าและบริการถูกต้องที่สุด แต่ไม่รับประกันว่าเนื้อหาทั้งหมดจะปราศจากข้อผิดพลาด
            และไม่รับผิดชอบต่อความเสียหายทางอ้อมที่เกิดจากการใช้งานเว็บไซต์
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-prompt font-bold text-lg text-black mb-2">7. การเปลี่ยนแปลงข้อกำหนด</h2>
          <p>
            เราอาจปรับปรุงข้อกำหนดการใช้งานนี้เป็นครั้งคราว การใช้งานเว็บไซต์ต่อหลังการปรับปรุง
            ถือว่าคุณยอมรับข้อกำหนดฉบับใหม่
          </p>
        </section>

        <section>
          <h2 className="font-prompt font-bold text-lg text-black mb-2">8. ติดต่อเรา</h2>
          <p>
            หากมีข้อสงสัยเกี่ยวกับข้อกำหนดการใช้งานนี้ ติดต่อได้ที่{" "}
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
