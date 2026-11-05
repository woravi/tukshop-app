"use client";
import {useEffect,useState} from 'react';
export default function CategorySelect({value,onChange}) {
 const [categories,setCategories]=useState([]);const [error,setError]=useState('');
 useEffect(()=>{let live=true;fetch('/api/categories').then(async res=>{if(!res.ok)throw new Error('โหลดหมวดหมู่ไม่สำเร็จ');return res.json();}).then(rows=>{if(live)setCategories(rows);}).catch(e=>{if(live)setError(e.message);});return ()=>{live=false;};},[]);
 return <div><label htmlFor="category">ประเภทกระเป๋า</label><select id="category" name="category" value={value??''} onChange={e=>onChange(categories.find(c=>String(c.id)===e.target.value)||null)} className="block w-full border rounded-md p-2"><option value="">ไม่ระบุ</option>{categories.map(c=><option key={c.id} value={c.id}>{c.parent_id?'↳ ':''}{c.name}</option>)}</select>{error&&<p role="alert">{error}</p>}<a href="/admin/categories" className="underline">จัดการหมวดหมู่</a></div>;
}
