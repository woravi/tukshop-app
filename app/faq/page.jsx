import InfoPage from "@/components/InfoPage";

export default function Page() {
  return <InfoPage title="คำถามที่พบบ่อย" intro="ข้อมูลเบื้องต้นสำหรับการเลือกซื้อ"><section><h2 className="text-xl font-semibold">ดูรายละเอียดกระเป๋าได้ที่ไหน?</h2><p className="mt-2">เลือกสินค้าเพื่อดูรูปภาพ ราคา และรายละเอียดที่ระบุไว้ในหน้าสินค้า</p></section><section><h2 className="text-xl font-semibold">ตรวจสอบการจัดส่งและการรับประกันได้อย่างไร?</h2><p className="mt-2">โปรดตรวจสอบรายละเอียดที่ระบุไว้สำหรับสินค้าและคำสั่งซื้อ เงื่อนไขอาจแตกต่างกัน</p></section></InfoPage>;
}
