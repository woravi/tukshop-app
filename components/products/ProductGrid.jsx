import { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";
import { useRouter } from "next/navigation";
import { BAG_CATEGORIES } from "@/lib/product-categories.mjs";
import { categoryHref } from "@/lib/category-navigation.mjs";

export default function ProductGrid({ products: initialProducts, itemsPerPage = 12, category }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const router = useRouter();

  useEffect(() => { setCurrentPage(1); }, [initialProducts]);
  useEffect(() => { setSelectedCategory(category || "all"); setCurrentPage(1); }, [category]);

  const products = useMemo(() => {
    const filtered = category || selectedCategory === "all"
      ? [...initialProducts]
      : initialProducts.filter((product) => product.category === selectedCategory);
    if (sortOrder === "highToLow") filtered.sort((a, b) => b.price - a.price);
    if (sortOrder === "lowToHigh") filtered.sort((a, b) => a.price - b.price);
    return filtered;
  }, [initialProducts, category, selectedCategory, sortOrder]);
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function handleCategoryChange(value) {
    setCurrentPage(1);
    setSelectedCategory(value);
    if (category) router.push(categoryHref(value));
  }

  return (
    <div className="container mx-auto px-[1px] py-8">
      <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <label htmlFor="category" className="mr-2 text-gray-700">ประเภทกระเป๋า:</label>
          <select id="category" value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="rounded-md bg-slate-50 p-1 text-gray-700">
            <option value="all">ทั้งหมด</option>
            {BAG_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="mr-2 text-gray-700">Sort:</label>
          <select id="sort" value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }} className="rounded-md bg-slate-50 p-1 text-gray-700">
            <option value="">Select</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="lowToHigh">Price: Low to High</option>
          </select>
        </div>
      </div>
      {products.length === 0 && <p className="text-gray-600">No products found.</p>}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
      {totalPages > 1 && <div className="flex justify-center items-center mt-8">
        {Array.from({ length: totalPages }, (_, index) => <button key={index} onClick={() => setCurrentPage(index + 1)} className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? "bg-slate-600 text-white" : "bg-gray-200 text-gray-700"}`}>{index + 1}</button>)}
      </div>}
    </div>
  );
}
