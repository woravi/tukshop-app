import { isAdminRole } from './role-authority.mjs';

// Compatibility/UI helpers only. Server handlers must call authorizeRoles.
export function adminAccessStatus(session) {
  if (!session?.user?.email) return 401;
  const user = session.user;
  return ('role' in user ? isAdminRole(user.role) : user.admin === true) ? 200 : 403;
}

export function ownsOrder(session, order) {
  if (!session?.user?.email || !order?.email) return false;
  return adminAccessStatus(session) === 200 ||
    session.user.email.trim().toLowerCase() === order.email.trim().toLowerCase();
}
