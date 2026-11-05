"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";

import { Menu, X } from "lucide-react";
import CartIcon from "../CartIcon";
import SearchDrawer from "./SearchDrawer";
import ProductDrawer from "./ProductDrawer";
import AdminDrawer from "./AdminDrawer";
import MobileMenu from "./MobileMenu";
import NavbarLinks from "./NavbarLinks";
import UserSection from "./UserSection";
import { Input } from "../ui/input";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const navbarRef = useRef(null);
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [adminPanelMob, setAdminPanelMob] = useState(false);
  const [productModile, setProductModile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    fetch("/api/categories")
      .then(response => {
        if (!response.ok) throw new Error("Categories unavailable");
        return response.json();
      })
      .then(rows => {
        if (active && Array.isArray(rows)) setCategories(rows
          .filter(row => row.active === true || row.active === 1)
          .sort((a, b) => Number(a.sort_order) - Number(b.sort_order) || Number(a.id) - Number(b.id)));
      })
      .catch(() => { if (active) setCategories([]); });
    return () => { active = false; };
  }, [pathname]);
  const [searchTerm, setSearchTerm] = useState({ search: "" });
  const [resultArr, setResultArr] = useState([]);

  const firstTwelveItems = resultArr.slice(0, 12);
  const [isSearching, setIsSearching] = useState(false);
  const user = session?.user;

  const closeMenus = useCallback(() => {
    setIsOpen(false);
    setProductOpen(false);
    setProductModile(false);
    setAdmin(false);
    setAdminPanelMob(false);
    setSearchOpen(false);
  }, []);

  useEffect(() => {
    closeMenus();
  }, [pathname, closeMenus]);

  useEffect(() => {
    const handleOutsidePointer = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        closeMenus();
      }
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [closeMenus]);

  const handleMenuOpen = () => {
    if (isOpen) closeMenus();
    else setIsOpen(true);
  };


  

  const setProductModile1 = () => {
    setProductModile(!productModile);
  };

  const setAdminPanelMobile = () => {
    setAdminPanelMob(!adminPanelMob);
  };

  const setMenuClose = closeMenus;

  const handleSearchClick = () => {
    setSearchOpen(true);
    setProductOpen(false);
  };

  function debounce(func, timeout = 1000) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  const debounceSearch = debounce((currentSearchTerm) => {
    handleSubmit(currentSearchTerm);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchTerm((prevState) => ({ ...prevState, [name]: value }));
    debounceSearch(value);
  };

  const handleSubmit = async (search) => {
    if (!search) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`/api/products/${search}`);
      setIsSearching(false);
      if (res.status === 200) {
        setResultArr(res.data);
      }
    } catch (error) {
      setIsSearching(false);
      console.log(error);
    }
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setIsOpen(false);
  };

  useEffect(() => {
    if (searchTerm.search !== "") {
      handleSubmit(searchTerm.search);
    }
    if (searchTerm.search === "") {
      setResultArr([]);
    }
  }, [searchTerm]);

  return (
    <div ref={navbarRef} className="z-40">
      <div className="w-full bg-slate-50 h-14">
        <div className="pl-2 pt-2 xl:hidden">
          <button type="button" onClick={handleMenuOpen} aria-label={isOpen ? "ปิดเมนู" : "เปิดเมนู"} aria-expanded={isOpen} aria-controls="mobile-navigation">
            {isOpen ? <X size={40} /> : <Menu size={40} />}
          </button>
        </div>
        <div className="hidden xl:flex justify-between">
          <SearchDrawer
            searchOpen={searchOpen}
            searchTerm={searchTerm}
            handleChange={handleChange}
            handleSearchClose={handleSearchClose}
            firstTwelveItems={firstTwelveItems}
            resultArr={resultArr}
          />
          <ProductDrawer
            categories={categories}
            productOpen={productOpen}
            setProductOpen={setProductOpen}
            category={category}
            setCategory={setCategory}
          />
          <div className="mt-[-17px] flex ml-4">
            <button
              type="button"
              onClick={() => {
                closeMenus();
                router.push("/");
              }}
              className="mt-7 text-xl font-bold text-slate-900"
              aria-label="TukShop หน้าแรก"
            >
              TukShop
            </button>
            <Input
              className="mt-7 h-8 w-44"
              onClick={handleSearchClick}
              placeholder="Search..."
            />
          </div>
          <NavbarLinks
            onNavigate={closeMenus}
            session={session}
            setProductOpen={setProductOpen}
            setAdmin={setAdmin}
          />
          <div className="z-40 flex items-center gap-1" aria-label="ตะกร้าสินค้า">
            <span className="text-xs text-slate-700">ตะกร้าสินค้า</span>
            <CartIcon />
          </div>
          <UserSection session={session} />
        </div>
      </div>
      <div
        onMouseEnter={() => setAdmin(true)}
        onMouseLeave={() => setAdmin(false)}
      >
        <AdminDrawer
          admin={admin}
          session={session}
          onNavigate={closeMenus}
          category={category}
          setCategory={setCategory}
        />
      </div>
      <MobileMenu
        categories={categories}
        isOpen={isOpen}
        setMenuClose={setMenuClose}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchTerm={searchTerm}
        handleChange={handleChange}
        handleSearchClose={handleSearchClose}
        firstTwelveItems={firstTwelveItems}
        resultArr={resultArr}
        productModile={productModile}
        setProductModile={setProductModile}
        setAdminPanelMob={setAdminPanelMob}
        session={session}
        user={user}
        adminPanelMob={adminPanelMob}
      />
    </div>
  );
};

export default Navbar;
