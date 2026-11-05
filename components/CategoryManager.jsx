"use client";
import { useEffect, useState } from 'react';

const blank = { name: '', parent_id: null, sort_order: 0, active: true };
export default function CategoryManager() {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch('/api/categories?all=1');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setRows(data);
  }
  useEffect(() => { load().catch(e => setError(e.message)); }, []);

  async function submit(url, method, body) {
    setError('');
    setBusy(true);
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await load();
      setDraft(blank);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  function save(e) {
    e.preventDefault();
    return submit('/api/categories' + (draft.id ? '/' + draft.id : ''), draft.id ? 'PUT' : 'POST', {
      ...draft, sort_order: Number(draft.sort_order), parent_id: draft.parent_id ? Number(draft.parent_id) : null,
    });
  }
  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const ordered = [...rows];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    return submit('/api/categories', 'PATCH', { order: ordered.map(({ id, version }) => ({ id, version })) });
  }

  return <section className="space-y-4">
    <h1 className="text-2xl font-bold">จัดการหมวดหมู่</h1>
    <p>ใช้ปุ่มขึ้น/ลงหรือแก้ไขลำดับ หมวดหมู่ที่มีสินค้าหรือหมวดย่อยจะปิดไม่ได้</p>
    {error && <p role="alert" className="text-red-700">{error} <button type="button" onClick={() => load().then(() => setDraft(blank)).catch(e => setError(e.message))}>โหลดใหม่</button></p>}
    <ol>{rows.map((c, index) => <li key={c.id} className="flex flex-wrap gap-4 border-b py-3">
      <span>#{c.id} · {c.parent_id ? '↳ ' : ''}{c.name} · ลำดับ {c.sort_order} · {c.active ? 'เปิด' : 'ปิด'}</span>
      <button type="button" disabled={busy || index === 0} aria-label={`ย้าย ${c.name} ขึ้น`} onClick={() => move(index, -1)}>↑</button>
      <button type="button" disabled={busy || index === rows.length - 1} aria-label={`ย้าย ${c.name} ลง`} onClick={() => move(index, 1)}>↓</button>
      <button type="button" disabled={busy} className="underline" onClick={() => setDraft({ ...c, active: Boolean(c.active) })}>แก้ไข / เปลี่ยนลำดับ</button>
    </li>)}</ol>
    <form onSubmit={save} className="border rounded p-4 space-y-3">
      <h2>{draft.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}</h2>
      <label className="block">ชื่อ<input aria-label="ชื่อหมวดหมู่" className="border block p-2" required maxLength={255} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
      <label className="block">หมวดหมู่แม่<select className="border block p-2" value={draft.parent_id ?? ''} onChange={e => setDraft({ ...draft, parent_id: e.target.value || null })}>
        <option value="">ไม่มี</option>{rows.filter(c => c.active && c.id !== draft.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select></label>
      <label className="block">ลำดับ<input className="border block p-2" type="number" min="0" max="2147483647" step="1" required value={draft.sort_order} onChange={e => setDraft({ ...draft, sort_order: e.target.value })} /></label>
      <label className="block"><input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} /> เปิดใช้งาน</label>
      <button disabled={busy} className="bg-blue-700 text-white p-2 rounded">บันทึกหมวดหมู่</button> <button type="button" disabled={busy} onClick={() => setDraft(blank)}>ยกเลิก / เพิ่มใหม่</button>
    </form>
  </section>;
}
