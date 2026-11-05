export const USER_ROLES = Object.freeze(['owner', 'manager', 'kitchen', 'customer']);
export const isUserRole = role => USER_ROLES.includes(role);
export const isAdminRole = role => role === 'owner' || role === 'manager';
export const isUserId = id => /^(?:[1-9]\d*)$/.test(String(id ?? ''));

// The signed session identifies an account, never its current authority.
export async function authorizeSessionRoles(session, roles, db) {
  const id = session?.user?._id;
  if (!isUserId(id)) return { status: 401, actor: null };
  const [rows] = await db.execute('SELECT id,email,role FROM users WHERE id=?', [String(id)]);
  if (!rows.length) return { status: 401, actor: null };
  const user = rows[0];
  if (!isUserRole(user.role)) return { status: 403, actor: null };
  const actor = { id: String(user.id), email: user.email, role: user.role };
  return { status: Array.isArray(roles) && roles.includes(actor.role) ? 200 : 403, actor };
}
