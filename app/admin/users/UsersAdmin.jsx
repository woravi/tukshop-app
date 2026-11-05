'use client';
import { useEffect, useState } from 'react';

const roles = [
  ['owner', 'เจ้าของร้าน (Owner)'],
  ['manager', 'ผู้ช่วยผู้จัดการ (Assistant manager)'],
  ['kitchen', 'ครัว (Kitchen)'],
  ['customer', 'ลูกค้า (Customer)'],
];
export default function UsersAdmin({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revoked, setRevoked] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetch(`/api/admin/users?${new URLSearchParams({ search, page: String(page) })}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) { setRevoked(true); setUsers([]); }
          throw new Error(body.error || 'Unable to load users');
        }
        setUsers(body.users);
        setDrafts({});
        setHasMore(body.hasMore);
      })
      .catch(error => { if (error.name !== 'AbortError') setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, page]);

  async function save(user) {
    const role = drafts[user.id];
    if (!role || role === user.role) return;
    setSaving(user.id); setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }),
      });
      const body = await response.json();
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) { setRevoked(true); setUsers([]); }
        throw new Error(body.error || 'Unable to change role');
      }
      setUsers(rows => rows.map(row => row.id === body.user.id ? body.user : row));
      setDrafts(values => { const next = { ...values }; delete next[user.id]; return next; });
      setNotice(`บันทึกสิทธิ์ของ ${body.user.email} แล้ว`);
    } catch (error) { setError(error.message); }
    finally { setSaving(null); }
  }
  return <main className="mx-auto max-w-6xl px-6 py-28 text-stone-900">
    <a href="/admin" className="underline">กลับหน้าจัดการร้าน</a>
    <h1 className="mt-6 text-3xl font-semibold">จัดการสิทธิ์ผู้ใช้งาน</h1>
    <p className="mt-3 text-stone-600">เจ้าของร้านเท่านั้นที่เปลี่ยนสิทธิ์ได้ ผู้ใช้ต้องสมัครบัญชีของตนเองก่อน ไม่มีการสร้างบัญชีหรือรหัสผ่านร่วมกันที่นี่</p>
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {notice && <p role="status" className="mt-4 text-green-800">{notice}</p>}
    {!revoked && <>
      <form className="my-6 flex gap-3" onSubmit={event => { event.preventDefault(); setPage(1); setSearch(query); }}>
        <label htmlFor="user-search" className="sr-only">ค้นหาชื่อหรืออีเมล</label>
        <input id="user-search" value={query} maxLength={320} onChange={event => setQuery(event.target.value)} placeholder="ค้นหาชื่อหรืออีเมล" className="min-w-0 flex-1 rounded border p-3" />
        <button className="rounded bg-stone-900 px-5 text-white" disabled={loading || !!saving}>ค้นหา</button>
      </form>
      {loading ? <p role="status">กำลังโหลด...</p> : <div className="overflow-x-auto"><table className="w-full text-left">
        <thead><tr><th className="p-3">ชื่อ</th><th className="p-3">อีเมล</th><th className="p-3">สิทธิ์</th><th className="p-3">บันทึก</th></tr></thead>
        <tbody>{users.map(user => <tr key={user.id} className="border-t">
          <td className="p-3">{user.name}</td><td className="p-3">{user.email}</td>
          <td className="p-3"><select aria-label={`สิทธิ์ของ ${user.email}`} className="rounded border p-2" value={drafts[user.id] ?? user.role} disabled={!!saving || user.id === currentUserId} onChange={event => setDrafts(values => ({ ...values, [user.id]: event.target.value }))}>
            {roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>{user.id === currentUserId && <p className="mt-1 text-xs">ไม่สามารถลดสิทธิ์ของตัวเองได้</p>}</td>
          <td className="p-3"><button className="rounded border px-4 py-2 disabled:opacity-40" disabled={!!saving || user.id === currentUserId || !drafts[user.id] || drafts[user.id] === user.role} onClick={() => save(user)}>{saving === user.id ? 'กำลังบันทึก...' : 'บันทึก'}</button></td>
        </tr>)}</tbody>
      </table>{users.length === 0 && <p className="p-3">ไม่พบผู้ใช้งาน</p>}</div>}
      <div className="mt-5 flex items-center gap-4">
        <button className="rounded border px-4 py-2 disabled:opacity-40" disabled={page === 1 || loading || !!saving} onClick={() => setPage(value => value - 1)}>ก่อนหน้า</button>
        <span>หน้า {page}</span>
        <button className="rounded border px-4 py-2 disabled:opacity-40" disabled={!hasMore || loading || !!saving} onClick={() => setPage(value => value + 1)}>ถัดไป</button>
      </div>
    </>}
  </main>;
}
