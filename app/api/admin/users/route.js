import { NextResponse } from 'next/server';
import { authorizeRoles } from '@/lib/server-access';
import { getPool } from '@/utils/config/dbConnection';
import { listUsers } from '@/lib/user-administration.mjs';

export const dynamic = 'force-dynamic';
export async function GET(request) {
  const { status } = await authorizeRoles(['owner']);
  if (status !== 200) return NextResponse.json({ error: 'Forbidden' }, { status });
  try {
    const { searchParams } = new URL(request.url);
    const result = await listUsers(getPool(), {
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20),
      search: searchParams.get('search') ?? '',
    });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error.status === 400 ? error.message : 'Unable to load users' }, { status: error.status === 400 ? 400 : 500 });
  }
}
