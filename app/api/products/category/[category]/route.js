import connect from "@/utils/config/dbConnection";
import { Product } from "@/utils/models/Product";
import { BAG_CATEGORIES } from "@/lib/product-categories.mjs";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { category } = await params;
  if (!BAG_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Unknown category" }, { status: 404 });
  }
  try {
    await connect();
    const products = await Product.find({ category }).populate("user", "name profileImage").sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Unable to load products" }, { status: 500 });
  }
}
