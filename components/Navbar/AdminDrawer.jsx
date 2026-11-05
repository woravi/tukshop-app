import React from "react";
import Link from "next/link";
import { staffNavigation } from "./navigation.mjs";

const AdminDrawer = ({ admin, session, onNavigate }) => {
  const links = staffNavigation(session?.user);
  if (!admin || !links.length) return null;
  return (
    <nav aria-label="จัดการร้าน" className="max-h-[75vh] overflow-y-auto w-[40%] dots bg-white absolute mt-[3px] ml-[50%] z-20 rounded-b-lg shadow-lg">
      <h2 className="bg-slate-100 px-5 py-3 text-xl font-bold text-black">จัดการร้าน</h2>
      <ul className="p-3">
        {links.map(({ href, label }) => <li key={href}>
          <Link href={href} onClick={onNavigate} className="block rounded px-3 py-2 text-slate-800 hover:bg-sky-100">{label}</Link>
        </li>)}
      </ul>
    </nav>
  );
};

export default AdminDrawer;
