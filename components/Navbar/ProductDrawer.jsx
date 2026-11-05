import React from "react";
import Link from "next/link";

import { categoryHref } from "@/lib/category-navigation.mjs";

const ProductDrawer = ({
  categories = [],
  productOpen,
  setProductOpen,
  category,
  setCategory,
}) => {
  return (
    productOpen && (
      <div
        className="max-h-[75vh] overflow-y-auto w-[40%] dots bg-white z-20 absolute mt-[59px] ml-[10%]"
        onMouseLeave={() => setProductOpen(false)}
        onMouseEnter={() => setProductOpen(true)}
      >
        <div className="flex justify-between  w-full h-full">
          <div className=" w-full h-full flex flex-col justify-between">
            <div>
              <div className="bg-slate-100 h-14 w-full flex justify-center">
                <p className="text-2xl pt-2 text-black font-bold">Category</p>
              </div>
              <div className="bg-gray-400 h-[2px] w-full"></div>
            </div>
            <div>
              <ul>
                {[{ id: "all", name: "สินค้าทั้งหมด" }, ...categories].map((cat) => (
                  <li
                    key={cat.id}
                    onMouseEnter={() => setCategory(cat.id)}
                    className={`text-lg w-[80%] cursor-pointer py-[5px] ml-4 ${
                      category === cat.id
                        ? " bg-sky-400/30 rounded-md fadeRight"
                        : null
                    }`}
                  >
                    <Link
                      href={categoryHref(cat.id)}
                      onClick={() => setProductOpen(false)}
                      className="pl-2 text-lg"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-gray-400 h-[88%] mt-[2%] w-[2px]"></div>
        </div>
      </div>
    )
  );
};

export default ProductDrawer;
