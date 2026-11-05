import connect from "@/utils/config/dbConnection";
import { Product } from "@/utils/models/Product";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminAccessStatus } from "@/lib/access.mjs";
import { validateImageUrls, validateStock } from "@/lib/mysql-model.mjs";

export async function GET(req, res) {
  await connect();

  const foundProducts = await Product.find({})
    .populate("user", "name profileImage")
    .sort({ createdAt: -1 });

  if (foundProducts) {
    return NextResponse.json(foundProducts);
  } else {
    return new NextResponse({ error: "Cant find products" }, { status: 500 });
  }
}

export async function POST(req, res) {
  const session = await getServerSession(authOptions);
  const access = adminAccessStatus(session);
  if (access !== 200) return NextResponse.json({ error: "Forbidden" }, { status: access });
  await connect();

  const body = await req.json();

  const {
    stock = 0,
    name,
    description,
    images,
    brand,
    material,
    originalPrice,
    bracelet,
    price,
    condition,
    movement,
    thickness,
    glass,
    luminova,
    casematerial,
    crown,
    bandsize,
    lugs,
    water,
  } = body;

  try { validateStock(stock); } catch { return NextResponse.json({error:"Invalid stock"},{status:400}); }
  try { validateImageUrls(images); } catch {
    return NextResponse.json({error:'Invalid product images'},{status:400});
  }
  try {
  const savedProduct = await Product.create({
    stock,
    name,
    description,
    images,
    brand,
    material,
    originalPrice,
    bracelet,
    price,
    condition,
    user: session.user._id,
    movement,
    thickness,
    glass,
    luminova,
    casematerial,
    crown,
    bandsize,
    lugs,
    water,
  });

  return NextResponse.json({
    message: "Product created successfully",
    success: true,
    savedProduct,
  });
  } catch {return NextResponse.json({error:'Product could not be created'},{status:400});}
}
