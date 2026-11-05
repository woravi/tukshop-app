import { NextResponse } from 'next/server';
import { authorizeRoles } from '@/lib/server-access';
import { getPool } from '@/utils/config/dbConnection';
import { deleteOwnAccount } from '@/lib/user-administration.mjs';

export async function DELETE() {
  const { status, actor } = await authorizeRoles(['owner', 'manager', 'kitchen', 'customer']);
  if (status !== 200) return NextResponse.json({ error: 'Not authenticated' }, { status });
  try {
    await deleteOwnAccount(getPool(), actor);
    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.status === 409 ? error.message : 'Error deleting user account' }, { status: error.status === 409 || error.status === 401 ? error.status : 500 });
  }
}
