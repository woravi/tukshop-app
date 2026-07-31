import type { Metadata } from "next";
import { Prompt, Kanit } from "next/font/google";
import Providers from "@/components/Providers";
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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TukShop | Digital Boutique & Commerce OS",
  description: "TukShop - แพลตฟอร์มการค้าและระบบ POS ยุคใหม่ ผสมผสานความหรูหราแบบ Digital Boutique มอบประสบการณ์ช้อปปิ้งและจัดการร้านค้าไร้รอยต่อ",
  keywords: ["TukShop", "Fashion POS", "Digital Boutique", "E-Commerce OS", "ระบบ POS ร้านค้า"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${promptFont.variable} ${kanitFont.variable}`}>
      <body className="antialiased bg-white text-black selection:bg-black selection:text-white font-kanit">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
