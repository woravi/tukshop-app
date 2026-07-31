import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findMemberByEmail, createMember } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
    }

    const existing = findMemberByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบแทน' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const member = createMember({
      name: `${firstName} ${lastName}`,
      email,
      phone: phone || '',
      provider: 'credentials',
      passwordHash,
    });

    return NextResponse.json({ success: true, member: { id: member.id, name: member.name, email: member.email } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
