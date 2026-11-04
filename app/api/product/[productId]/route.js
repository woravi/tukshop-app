import { NextResponse } from "next/server";
import connect from "@/utils/config/dbConnection";
import { Product } from "@/utils/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminAccessStatus } from "@/lib/access.mjs";
import { validateImageUrls } from "@/lib/mysql-model.mjs";

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

  try {
    if ('images' in body) validateImageUrls(body.images);
    const {user,averageRating,numReviews,featured,...safeBody} = body;
    const updatedProduct = await Product.findByIdAndUpdate(productId, safeBody, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
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
