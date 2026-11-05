import { NextResponse } from "next/server";
import connect from "@/utils/config/dbConnection";
import { Product } from "@/utils/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminAccessStatus } from "@/lib/access.mjs";
import { validateImageUrls, validateStock } from "@/lib/mysql-model.mjs";
import { validateCategory } from "@/lib/product-categories.mjs";

export async function GET(req, { params }) {
  await connect();
  const { productId } = await params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "errot fetching product" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  const access = adminAccessStatus(session);
  if (access !== 200) return NextResponse.json({ error: "Forbidden" }, { status: access });
  await connect();
  const { productId } = await params;
  const body = await req.json();
  if ('category' in body) {
    try { validateCategory(body.category); } catch { return NextResponse.json({error:"Invalid category"},{status:400}); }
  }

  try {
    if ('stock' in body) {
      try { validateStock(body.stock); validateStock(body.expectedStock); }
      catch { return NextResponse.json({error:'Invalid stock or expected stock'},{status:400}); }
    }
    if ('images' in body) validateImageUrls(body.images);
    const {user,averageRating,numReviews,featured,expectedStock,...safeBody} = body;
    const updatedProduct = await Product.findByIdAndUpdate(productId, safeBody, {
      expectedStock: 'stock' in body ? expectedStock : undefined,
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error.message?.startsWith("Stock changed")) return NextResponse.json({error:error.message},{status:409});
    return NextResponse.json(
      { error: "errot updating product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  const access = adminAccessStatus(session);
  if (access !== 200) return NextResponse.json({ error: "Forbidden" }, { status: access });
  await connect();
  const { productId } = await params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }

    return NextResponse.json({message: "product deleted sucessfully"});
  } catch (error) {
    return NextResponse.json(
      { error: "errot deleting product" },
      { status: 500 }
    );
  }
}
