import React from "react";
import { staffNavigation } from "./navigation.mjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const NavbarLinks = ({ session, setProductOpen, setAdmin, onNavigate }) => {
  return (
    <ul className="flex items-start pt-2">
      <li className="px-1"><Link href="/food" onClick={onNavigate} className="inline-flex h-10 items-center px-2 text-base hover:text-sky-600">ร้านอาหาร</Link></li>
      <li className="px-1"><Link href="/food/cart" onClick={onNavigate} className="inline-flex h-10 items-center px-2 text-sm hover:text-sky-600">ตะกร้าอาหาร</Link></li>
      <li className="px-2">
        <Button
          onMouseEnter={() => setProductOpen(true)}
          onClick={() => setProductOpen((prev) => !prev)}
        >
          <span className="text-lg no-underline transition-all duration-300 hover:text-sky-400/90">
            ร้านสินค้า
          </span>
        </Button>
      </li>
      <li className="px-2">
        <Button >
          <Link href="/blog" onClick={onNavigate}>
            <span className="text-lg no-underline transition-all duration-300 hover:text-sky-400/90">
              Blog
            </span>
          </Link>
        </Button>
      </li>
      <li className="px-2">
        <Button>
          <Link href="/contact" onClick={onNavigate}>
            <span className="text-lg no-underline transition-all duration-300 hover:text-sky-400/90">
              Contact
            </span>
          </Link>
        </Button>
      </li>
      <li className="px-2">
        <Button>
          <Link href="/about" onClick={onNavigate}>
            <span className="text-lg no-underline transition-all duration-300 hover:text-sky-400/90">
              About
            </span>
          </Link>
        </Button>
      </li>
      {staffNavigation(session?.user).length > 0 && (
        <li className="px-2">
          <Button
            onMouseEnter={() => setAdmin(true)}
            onClick={() => setAdmin((prev) => !prev)}
          >
            <span className="text-lg no-underline transition-all duration-300 hover:text-emerald-600/90">
              จัดการร้าน
            </span>
          </Button>
        </li>
      )}
    </ul>
  );
};

export default NavbarLinks;
