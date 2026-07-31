import { NextResponse } from 'next/server';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/db';

export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brand, category, title, price, stock, badge, image, description, userRole, userName } = body;

    // Verify Manager or Admin Permission
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'สิทธิ์ไม่เพียงพอ! เฉพาะพนักงานระดับผู้จัดการ (Manager) หรือ Admin เท่านั้นที่สามารถเพิ่มสินค้าได้' 
      }, { status: 403 });
    }

    if (!title || price === undefined || stock === undefined) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูล ชื่อสินค้า ราคา และจำนวนสต็อก ให้ครบถ้วน' }, { status: 400 });
    }

    const qrCode = `TUK-${(brand || 'ITEM').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newProduct = addProduct({
      brand: brand || 'TUKSHOP',
      category: category || 'women',
      title,
      price: Number(price),
      stock: Number(stock),
      badge: badge || 'NEW',
      qrCode,
      image: image || '/images/studio_hero_banner.jpg',
      description: description || 'สินค้าคุณภาพพรีเมียมจาก TukShop'
    }, userName || 'Manager');

    return NextResponse.json({ success: true, product: newProduct, message: 'บันทึกสินค้าใหม่สำเร็จเรียบร้อยแล้ว' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, userRole, userName, ...updates } = body;

    // Verify Manager or Admin Permission
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'สิทธิ์ไม่เพียงพอ! เฉพาะพนักงานระดับผู้จัดการ (Manager) เท่านั้นที่สามารถแก้ไขข้อมูลสินค้าได้' 
      }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const updated = updateProduct(id, updates, userName || 'Manager');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated, message: 'อัปเดตข้อมูลสินค้าและสต็อกเรียบร้อยแล้ว' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const role = searchParams.get('role');

    if (role !== 'MANAGER' && role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'สิทธิ์ไม่เพียงพอ! เฉพาะผู้จัดการเท่านั้น' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const deleted = deleteProduct(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
