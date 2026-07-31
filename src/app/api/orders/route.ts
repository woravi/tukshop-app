import { NextResponse } from 'next/server';
import { getOrders, addOrder, updateOrderStatus } from '@/lib/db';

export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, email, phone, items, totalAmount } = body;

    if (!customerName || !items || !items.length) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลลูกค้าและรายการสินค้าให้ครบถ้วน' }, { status: 400 });
    }

    const newOrder = addOrder({
      customerName,
      email: email || 'customer@tukshop.com',
      phone: phone || '080-000-0000',
      items,
      totalAmount: Number(totalAmount),
      status: 'PAID'
    });

    return NextResponse.json({ success: true, order: newOrder, message: 'สร้างคำสั่งซื้อสำเร็จและตัดสต็อกเรียบร้อยแล้ว' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Order ID and Status required' }, { status: 400 });
    }

    const updated = updateOrderStatus(orderId, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
