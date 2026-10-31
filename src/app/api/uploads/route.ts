import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function detectImageExtension(buffer: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userRole = formData.get('userRole');

    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'สิทธิ์ไม่เพียงพอสำหรับอัปโหลดรูปสินค้า' },
        { status: 403 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกไฟล์รูปสินค้า' },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'รูปสินค้าต้องมีขนาดไม่เกิน 5 MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = detectImageExtension(buffer);
    if (!extension) {
      return NextResponse.json(
        { success: false, error: 'ไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPG, PNG และ WebP' },
        { status: 400 }
      );
    }

    const uploadDirectory = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDirectory, { recursive: true });

    const filename = `product-${Date.now()}-${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDirectory, filename), buffer, { flag: 'wx' });

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename
    });
  } catch (error) {
    console.error('Product image upload failed:', error);
    return NextResponse.json(
      { success: false, error: 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่' },
      { status: 500 }
    );
  }
}
