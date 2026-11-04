import { NextResponse } from "next/server";
import dbConnect from "@/utils/config/dbConnection";
import Order from "@/utils/models/Order";
import { Product } from "@/utils/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminAccessStatus } from "@/lib/access.mjs";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 5;


  const skip = (page - 1) * limit;

  try {
    const orders = await Order.find({ email: session.user.email })
      .populate({
        path: "cartProducts.product",
        model: Product,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ email: session.user.email });
    const hasMore = totalOrders > skip + orders.length;

    return NextResponse.json({
      orders,
      hasMore,
      totalOrders,
    });
  } catch (error) {
    console.log("Error fetching orders:", error);
    return NextResponse.json(
      {
        error: "Internal server error at api/order",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  const access = adminAccessStatus(session);
  if (access !== 200) return NextResponse.json({ error: "Forbidden" }, { status: access });
  await dbConnect();

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        {
          error: "order id is required",
        },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "delivered",
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        {
          error: "order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Order status updated to delivered",
      order: updatedOrder,
    });
  } catch (error) {
    console.log("Error fetching orders:", error);
    return NextResponse.json(
      {
        error: "Internal server error at api/order",
      },
      { status: 500 }
    );
  }
}
