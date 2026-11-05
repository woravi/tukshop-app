"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import ProductGrid from "@/components/products/ProductGrid";
import LoadingErrorComponent from "@/components/Loader/LoadingErrorComponent";

export default function BagCategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const url = category === "all" ? "/api/products" : `/api/products/category/${encodeURIComponent(category)}`;
    axios.get(url).then(({ data }) => {
      if (active) setProducts(data);
    }).catch(() => {
      if (active) setError("Error loading products");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [category]);

  if (loading || error) return <LoadingErrorComponent loading={loading} error={error} />;
  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-700 mb-4">{category === "all" ? "กระเป๋าทั้งหมด" : category}</h1>
      <p className="text-slate-700">สินค้าทั้งหมด: {products.length}</p>
      <ProductGrid products={products} category={category} />
    </main>
  );
}
