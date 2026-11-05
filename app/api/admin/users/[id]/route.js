import { NextResponse } from 'next/server';
import { authorizeRoles } from '@/lib/server-access';
import { getPool } from '@/utils/config/dbConnection';
import { changeUserRole } from '@/lib/user-administration.mjs';

export async function PATCH(request, { params }) {
  const { status, actor } = await authorizeRoles(['owner']);
  if (status !== 200) return NextResponse.json({ error: 'Forbidden' }, { status });
  try {
    const { id } = await params;
    const body = await request.json();
    const user = await changeUserRole(getPool(), actor, id, body);
    return NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : [400, 403, 404, 409].includes(error.status) ? error.status : 500;
    return NextResponse.json({ error: error instanceof SyntaxError ? 'Invalid JSON' : status === 500 ? 'Unable to change user role' : error.message }, { status });
  }
}
