import { NextResponse } from 'next/server';
import { scanQRCode, receiveStockByQR } from '@/lib/db';

// Scan & Track Product by QR Code
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุรหัส QR Code หรือ SKU' }, { status: 400 });
    }

    const { product, logs } = scanQRCode(code);
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: `ไม่พบข้อมูลสินค้าสำหรับรหัส QR Code: "${code}"` 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      product, 
      logs,
      message: 'ค้นพบข้อมูลสินค้าและประวัติการเคลื่อนไหวสต็อกเรียบร้อยแล้ว' 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'QR Scan Failed' }, { status: 500 });
  }
}

// Receive Stock into Inventory via QR Code Scan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrCode, addQuantity, userRole, userName, note } = body;

    // Verify Manager or Admin Permission
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'สิทธิ์ไม่เพียงพอ! เฉพาะพนักงานระดับผู้จัดการ (Manager) เท่านั้นที่บันทึกรับสินค้าเข้าสต็อกได้' 
      }, { status: 403 });
    }

    if (!qrCode || !addQuantity || addQuantity <= 0) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ QR Code และจำนวนรับเข้าสินค้าให้ถูกต้อง (>0)' }, { status: 400 });
    }

    const { product, log } = receiveStockByQR(qrCode, Number(addQuantity), userName || 'Manager', note);
    if (!product) {
      return NextResponse.json({ success: false, error: `ไม่พบสินค้าตรงกับ QR Code: "${qrCode}"` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product,
      log,
      message: `บันทึกรับสินค้าเข้าสำเร็จ! เพิ่มจำนวน +${addQuantity} ชิ้น (สต็อกรวมปัจจุบัน: ${product.stock} ชิ้น)`
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Stock Receive Failed' }, { status: 500 });
  }
}
