import { authorizeRoles } from '@/lib/server-access';
import UsersAdmin from './UsersAdmin';

export const dynamic = 'force-dynamic';
export default async function UserAdministrationPage() {
  const { status, actor } = await authorizeRoles(['owner']);
  if (status !== 200) return <main className="mx-auto max-w-5xl px-6 py-28"><h1 className="text-2xl font-semibold">{status === 401 ? 'กรุณาเข้าสู่ระบบ' : 'สำหรับเจ้าของร้านเท่านั้น'}</h1><p>Only the shop owner can manage staff access.</p></main>;
  return <UsersAdmin currentUserId={actor.id} />;
}
