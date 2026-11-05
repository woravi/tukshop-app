"use client";
import {useEffect,useState} from 'react';
const blank={sku:'',color:'',size:'',price:0,stock:0,active:true};
export default function VariantManager({productId,onSaved}) {
 const [rows,setRows]=useState([]),[draft,setDraft]=useState(blank),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=async()=>{const res=await fetch(`/api/product/${productId}/variants?all=1`);const data=await res.json();if(!res.ok)throw new Error(data.error);setRows(data);};
 useEffect(()=>{if(productId)load().catch(e=>setError(e.message));},[productId]);
 async function save(){setBusy(true);setError('');try{const res=await fetch(`/api/product/${productId}/variants${draft.id?'/'+draft.id:''}`,{method:draft.id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...draft,price:Number(draft.price),stock:Number(draft.stock)})});const data=await res.json();if(!res.ok)throw new Error(data.error);await load();if(onSaved)await onSaved();setDraft(blank);}catch(e){setError(e.message);}finally{setBusy(false);}}
 if(!productId)return <p>บันทึกสินค้าก่อนเพิ่มสีและขนาด</p>;
 return <section className="border rounded p-4 space-y-3"><h2 className="text-xl font-bold">สี / ขนาด และสต็อกแยกรุ่น</h2><p>เมื่อมีรุ่นย่อย สต็อกรวมจะคำนวณจากรุ่นที่เปิดใช้งานเท่านั้น บันทึกทีละรุ่น และโหลดใหม่เมื่อมีข้อขัดแย้ง</p>{error&&<p role="alert" className="text-red-700">{error} <button type="button" onClick={()=>load().then(()=>setDraft(blank)).catch(e=>setError(e.message))}>โหลดใหม่</button></p>}
 <ul>{rows.map(v=><li key={v.id} className="flex gap-3 py-2"><span>{v.sku} · {v.color} / {v.size} · ฿{v.price} · คงเหลือ {v.stock} · {v.active?'เปิด':'ปิด'}</span><button type="button" onClick={()=>setDraft({...v})} className="underline">แก้ไข</button></li>)}</ul>
 <div className="grid grid-cols-2 gap-3">{[['sku','SKU','text'],['color','สี','text'],['size','ขนาด','text'],['price','ราคา (THB)','number'],['stock','สต็อก','number']].map(([key,label,type])=><label key={key}>{label}<input className="block border p-2 w-full" aria-label={label} type={type} min={type==='number'?0:undefined} step={key==='price'?'0.01':key==='stock'?'1':undefined} value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}</div>
 <label className="block"><input type="checkbox" checked={Boolean(draft.active)} onChange={e=>setDraft({...draft,active:e.target.checked})}/> เปิดใช้งาน</label>
 <button type="button" disabled={busy} onClick={save} className="bg-blue-700 text-white p-2 rounded">{draft.id?'บันทึกการแก้ไข':'เพิ่มรุ่นย่อย'}</button> <button type="button" onClick={()=>setDraft(blank)}>ยกเลิก / เพิ่มใหม่</button>
 </section>;
}
