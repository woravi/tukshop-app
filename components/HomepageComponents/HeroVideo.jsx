"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const photos = [
  { src: "/api/images/2", alt: "ภาพกระเป๋าจากแคตตาล็อก TukShop แบบที่ 1" },
  { src: "/api/images/7", alt: "ภาพกระเป๋าจากแคตตาล็อก TukShop แบบที่ 2" },
  { src: "/api/images/12", alt: "ภาพกระเป๋าจากแคตตาล็อก TukShop แบบที่ 3" },
  { src: "/api/images/17", alt: "ภาพกระเป๋าจากแคตตาล็อก TukShop แบบที่ 4" },
];

export default function ShopHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Do not start playback until the visitor's motion preference is known.
    if (reducedMotion || paused || hovering || reducedMotion === null) return;
    const timer = setInterval(() => setActive((index) => (index + 1) % photos.length), 5500);
    return () => clearInterval(timer);
  }, [reducedMotion, paused, hovering]);

  return (
    <section aria-labelledby="bag-hero-heading" className="relative overflow-hidden bg-[#eee9e1] text-[#29251f]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-12 sm:px-10 lg:min-h-[680px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:px-16 lg:py-16">
        <div className="relative z-10 max-w-xl">
          <p className="mb-7 flex items-center gap-3 text-xs font-medium tracking-[0.3em]"><span className="h-px w-10 bg-[#76654e]" />TUKSHOP / EVERYDAY COLLECTION</p>
          <h1 id="bag-hero-heading" className="text-4xl font-medium leading-[1.35] tracking-tight sm:text-5xl lg:text-6xl">กระเป๋าที่ใช่<br /><span className="text-[#7c6549]">ในทุกวันของคุณ</span></h1>
          <p className="mt-6 max-w-sm text-base leading-8 text-stone-600">ให้สไตล์ของคุณเล่าเรื่อง ผ่านกระเป๋าที่คุณเลือก<br className="hidden sm:block" />เลือกชมภาพและรายละเอียดจากแคตตาล็อกของร้าน</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href="/products/category/all" className="inline-flex min-h-12 items-center gap-6 rounded-full bg-[#29251f] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#574936] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#29251f]">สำรวจคอลเลกชัน <span aria-hidden="true">↗</span></Link>
            <a href="#catalogue" className="py-3 text-sm underline decoration-stone-400 underline-offset-8">ดูสินค้าในหน้านี้</a>
          </div>
          <p className="mt-10 text-xs tracking-widest text-stone-500">YOUR DAY. YOUR STYLE. YOUR BAG.</p>
        </div>
        <div
          className="relative min-w-0"
          role="region"
          aria-roledescription="carousel"
          aria-label="ภาพกระเป๋าจากแคตตาล็อก"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onFocusCapture={(event) => { if (!event.target.closest('[data-playback]')) setPaused(true); }}
        >
          <div className="absolute -right-10 -top-8 h-64 w-64 rounded-full border border-[#d5c8b5] sm:h-96 sm:w-96" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-t-[7rem] rounded-b-3xl bg-white p-5 shadow-[0_24px_70px_-30px_rgba(63,48,29,0.3)] sm:rounded-t-[10rem] sm:p-8">
            <div className="relative aspect-square" aria-live="off">
              <AnimatePresence initial={false}>
                <motion.div
                  key={photos[active].src}
                  className="absolute inset-0"
                  initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.96, rotate: -3 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 1.03, rotate: 2 }}
                  transition={{ duration: reducedMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image src={photos[active].src} alt={photos[active].alt} fill priority={active === 0} sizes="(max-width: 1023px) 90vw, 45vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between border-t border-stone-100 pt-5 text-xs tracking-[0.18em] text-stone-500"><span>THE BAG EDIT</span><span>{String(active + 1).padStart(2, "0")} / 04</span></div>
          </div>
          <div className="relative mt-5 grid grid-cols-4 gap-3">{photos.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              aria-label={`ดูภาพกระเป๋า ${index + 1} จาก ${photos.length}`}
              aria-pressed={active === index}
              onClick={() => { setActive(index); setPaused(true); }}
              className={`relative aspect-[4/3] min-h-12 overflow-hidden rounded-xl bg-white transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#574936] ${active === index ? "ring-2 ring-[#7c6549] ring-offset-2 ring-offset-[#eee9e1]" : "ring-1 ring-[#d5c8b5] hover:ring-[#7c6549]"}`}
            >
              <Image src={photo.src} alt="" fill sizes="(max-width: 1023px) 20vw, 10vw" className="object-contain p-2" />
            </button>
          ))}</div>
          <div className="relative mt-4 flex min-h-11 items-center justify-between gap-3 text-xs text-stone-600">
            <span>ภาพจากแคตตาล็อกของร้าน</span>
            {!reducedMotion && <button data-playback type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} className="min-h-11 rounded-full px-3 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#574936]">{paused ? "เล่นภาพอัตโนมัติ" : "หยุดภาพอัตโนมัติ"}</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
