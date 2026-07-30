import type { Metadata } from "next";
import { Prompt, Kanit } from "next/font/google";
import "./globals.css";

const promptFont = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-prompt",
  display: "swap",
});

const kanitFont = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TukShop - แพลตฟอร์มการค้าและ POS ยุคใหม่สไตล์ Neo-Brutalism",
  description: "ขับเคลื่อนธุรกิจและร้านค้าของคุณสู่ยุคใหม่ด้วย TukShop ระบบ POS, E-Commerce และ AI Analytics ที่เร็ว แรง จัดจ้าน ดีไซน์ระดับโลก",
  keywords: ["TukShop", "POS", "Neo Brutalism", "E-Commerce", "Next.js Landing Page", "ระบบจัดการร้านค้า"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${promptFont.variable} ${kanitFont.variable}`}>
      <body className="antialiased bg-[#0A0A0A] text-white selection:bg-[#CCFF00] selection:text-[#0A0A0A]">
        {children}
      </body>
    </html>
  );
}
