import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getPool } from '@/utils/config/dbConnection';
import { authorizeSessionRoles } from './role-authority.mjs';

// Request-local SQL lookup: never cache an actor or authorize from a JWT role.
export async function authorizeRoles(roles) {
  const session = await getServerSession(authOptions);
  return authorizeSessionRoles(session, roles, {
    execute: (...args) => getPool().execute(...args),
  });
}
