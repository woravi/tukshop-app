export function adminAccessStatus(session) {
  if (!session?.user?.email) return 401;
  return session.user.admin === true ? 200 : 403;
}

export function ownsOrder(session, order) {
  if (!session?.user?.email || !order?.email) return false;
  return session.user.admin === true ||
    session.user.email.trim().toLowerCase() === order.email.trim().toLowerCase();
}
