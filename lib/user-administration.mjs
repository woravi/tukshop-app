import { isUserId, isUserRole, isAdminRole } from './role-authority.mjs';
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const publicUser = row => ({ id: String(row.id), name: row.name, email: row.email, role: row.role, createdAt: row.createdAt });

// Stable lock order serializes role changes/deletions and rechecks the actor.
// The shop has a small user table; locking all identities avoids last-owner races.
async function withLockedUsers(db, action) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.execute('SELECT id,name,email,role,createdAt FROM users ORDER BY id FOR UPDATE');
    const result = await action(connection, users);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

export async function changeUserRole(db, actor, id, body) {
  if (!isUserId(id) || !body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1 || !isUserRole(body.role)) fail(400, 'Provide only a valid role');
  return withLockedUsers(db, async (connection, users) => {
    const currentActor = users.find(user => String(user.id) === actor?.id);
    if (currentActor?.role !== 'owner') fail(403, 'Only an owner can manage user roles');
    const target = users.find(user => String(user.id) === String(id));
    if (!target) fail(404, 'Registered user not found');
    if (target.role === 'owner' && body.role !== 'owner') {
      if (users.filter(user => user.role === 'owner').length <= 1) fail(409, 'At least one owner must remain');
      if (String(target.id) === actor.id) fail(409, 'Owners cannot demote themselves');
    }
    await connection.execute('UPDATE users SET role=?,admin=? WHERE id=?', [body.role, isAdminRole(body.role), String(id)]);
    const [updated] = await connection.execute('SELECT id,name,email,role,createdAt FROM users WHERE id=?', [String(id)]);
    return publicUser(updated.find(user => String(user.id) === String(id)));
  });
}

export async function deleteOwnAccount(db, actor) {
  if (!isUserId(actor?.id)) fail(401, 'Not authenticated');
  return withLockedUsers(db, async (connection, users) => {
    const target = users.find(user => String(user.id) === actor.id);
    if (!target) fail(401, 'Account not found');
    // Owners must have a different owner change their role before deletion.
    if (target.role === 'owner') fail(409, 'An owner cannot delete their own account; ask another owner to change your role first');
    await connection.execute('DELETE FROM users WHERE id=?', [actor.id]);
    return { deleted: true };
  });
}

export async function listUsers(db, { page = 1, limit = 20, search = '' } = {}) {
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100 || typeof search !== 'string' || search.length > 320 || !Number.isSafeInteger((page - 1) * limit)) fail(400, 'Invalid user search or pagination');
  const filter = search ? ' WHERE LOCATE(?,email)>0 OR LOCATE(?,name)>0' : '';
  const args = search ? [search, search] : [];
  const [rows] = await db.execute(`SELECT id,name,email,role,createdAt FROM users${filter} ORDER BY id LIMIT ? OFFSET ?`, [...args, limit + 1, (page - 1) * limit]);
  return { users: rows.slice(0, limit).map(publicUser), page, hasMore: rows.length > limit };
}
