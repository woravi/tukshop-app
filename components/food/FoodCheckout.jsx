'use client';
import {useState,useEffect,useRef} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowLeft,ShoppingBag,MapPin,Clock,Check,ShieldCheck} from 'lucide-react';
import useFoodCart from '../../store/foodCartStore';
import {foodRequest,foodPrice,isOrderingOpen,orderPayload,submitFoodOrder,foodSettingsDisplay} from '../../lib/food-client.mjs';
import s from './food.module.css';
export default function FoodCheckout(){
  const router=useRouter();
  const {items,draft,setDraft,update,requestId,clear,pendingSubmission,beginSubmission,releaseSubmission}=useFoodCart();
  const [mounted,setMounted]=useState(false),[settings,setSettings]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[confirmed,setConfirmed]=useState(null);
  const inFlight=useRef(false);
  useEffect(()=>{setMounted(true);const controller=new AbortController();foodRequest('/api/food/settings',{signal:controller.signal}).then(result=>setSettings(result.settings)).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>controller.abort();},[]);
  const display=foodSettingsDisplay(settings);
  const open=isOrderingOpen(settings);
  const zones=settings?.delivery_enabled===true&&Array.isArray(settings?.delivery_zones)?settings.delivery_zones.filter(zone=>zone.enabled===true&&zone.fee!==''&&zone.fee!=null&&Number.isFinite(Number(zone.fee))):[];
  const zone=zones.find(zone=>String(zone.id)===String(draft.zone_id));
  const subtotal=items.reduce((sum,item)=>sum+Number(item.price)*item.quantity,0),fee=draft.method==='delivery'?Number(zone?.fee || 0):0;
  const change=event=>setDraft({[event.target.name]:event.target.value});
  async function submit(event){event.preventDefault();if(inFlight.current||(!open&&!pendingSubmission)||!items.length)return;
    if(!pendingSubmission){
    if(!draft.customer_name.trim()||!/^0\d{8,9}$/.test(draft.phone.trim())){setError('กรุณาระบุชื่อและเบอร์โทรศัพท์ไทยให้ครบถ้วน');return;}
    if(draft.method==='pickup'&&settings?.pickup_enabled!==true){setError('ร้านไม่เปิดรับอาหารเอง กรุณาเลือกวิธีจัดส่ง');return;}
    if(draft.method==='delivery'&&(!zone||!draft.address?.trim())){setError('กรุณาระบุพื้นที่จัดส่งและที่อยู่ให้ครบถ้วน');return;}
    if(!draft.scheduled_at){setError('กรุณาเลือกวันและเวลารับอาหาร');return;}
    }
    inFlight.current=true;setBusy(true);setError('');
    try{
      const payload=beginSubmission(pendingSubmission||orderPayload(draft,items,requestId()));
      const result=await submitFoodOrder(payload);
      setConfirmed(result);clear();router.push(`/food/orders/${encodeURIComponent(result.tracking_token)}`);
    }catch(e){if(e.status>=400&&e.status<500&&e.code!=='IDEMPOTENCY_CONFLICT')releaseSubmission();setError(e.message);}finally{inFlight.current=false;setBusy(false);}
  }
  if(!mounted)return <main className={s.shell}><p role="status">กำลังเปิดตะกร้าอาหาร…</p></main>;
  if(confirmed)return <main className={s.shell}><div className={s.panel}><Check/><h1>บันทึกออร์เดอร์แล้ว</h1><p>รอร้านยืนยันการรับออร์เดอร์</p><Link className={s.button} href={`/food/orders/${encodeURIComponent(confirmed.tracking_token)}`}>ติดตามออร์เดอร์</Link></div></main>;
  return <main className={s.shell}>
    <div className={s.top}><Link href="/food" className={s.secondary}><ArrowLeft size={17}/> เลือกเมนูเพิ่ม</Link><span className={s.small}>ตะกร้าอาหาร · แยกจากตะกร้าสินค้า</span></div>
    <p className={s.eyebrow}>YOUR NEXT GOOD MEAL</p><h1>ตะกร้าอาหารของคุณ</h1><p className={s.muted}>ไม่ต้องสมัครสมาชิก · ระบุข้อมูลเพื่อให้ร้านเตรียมอาหารให้ตรงเวลา</p>
    {error&&<div className={s.error} role="alert">{error}</div>}
    {pendingSubmission&&<div className={s.notice} style={{marginTop:20}} role="status"><strong>กำลังตรวจสอบออร์เดอร์เดิม</strong><p>ยังยืนยันผลการส่งไม่ได้ จึงล็อกรายการไว้เพื่อป้องกันออร์เดอร์ซ้ำ กรุณากดส่งรายการเดิมอีกครั้ง ระบบจะใช้รหัสเดิมแม้เปิดหน้านี้ใหม่</p></div>}
    {!open&&<div className={s.notice} style={{marginTop:24}} role="status"><strong>ยังไม่เปิดรับออร์เดอร์</strong><p>รายการของคุณยังอยู่ในตะกร้า เมื่อร้านเปิดรับจึงจะส่งออร์เดอร์ได้</p></div>}
    {!items.length?<div className={s.empty}><ShoppingBag size={32} style={{margin:'0 auto 14px'}}/><h2>ยังไม่มีอาหารในตะกร้า</h2><p className={s.muted}>เลือกมื้ออร่อยจากเมนูของเรา</p><Link href="/food" className={s.button} style={{marginTop:20}}>ไปเลือกเมนู</Link></div>:<div className={s.columns}>
      <section className={s.panel}><h2>รายการที่เลือก</h2>{items.map(item=><div key={item.key} className={s.line}><div><h3>{item.name}</h3>{item.options_label&&<p className={s.small}>{item.options_label}</p>}<p>{foodPrice(item.price)} / ที่</p><button type="button" className={s.small} disabled={busy||Boolean(pendingSubmission)} onClick={()=>update(item.key,0)}>นำออก</button></div><div><div className={s.quantity}><button type="button" aria-label={`ลด ${item.name}`} disabled={busy||Boolean(pendingSubmission)} onClick={()=>update(item.key,item.quantity-1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={`เพิ่ม ${item.name}`} disabled={busy||Boolean(pendingSubmission)||item.quantity>=50} onClick={()=>update(item.key,item.quantity+1)}>+</button></div><p style={{textAlign:'right',marginTop:8}}>{foodPrice(item.price*item.quantity)}</p></div></div>)}<div className={s.line}><span>ค่าอาหารโดยประมาณ</span><span>{foodPrice(subtotal)}</span></div>{draft.method==='delivery'&&<div className={s.line}><span>ค่าจัดส่ง{zone?` · ${zone.name}`:''}</span><span>{zone?foodPrice(fee):'เลือกพื้นที่จัดส่ง'}</span></div>}<div className={s.total}><span>รวมโดยประมาณ</span><span>{foodPrice(subtotal+fee)}</span></div><p className={s.small}>ราคาสุดท้ายและตัวเลือกอาหารตรวจสอบโดยร้านก่อนรับออร์เดอร์</p></section>
      <form onSubmit={submit} className={`${s.panel} ${s.form}`}><h2>รายละเอียดออร์เดอร์</h2><fieldset disabled={busy||Boolean(pendingSubmission)} className={s.form} style={{border:0,padding:0,margin:0,minWidth:0}}>
        <div className={s.row}><label className={s.field}>ชื่อผู้รับอาหาร<input name="customer_name" autoComplete="name" required maxLength={100} value={draft.customer_name} onChange={change}/></label><label className={s.field}>เบอร์โทรศัพท์<input name="phone" type="tel" autoComplete="tel" inputMode="tel" pattern="0[0-9]{8,9}" placeholder="เบอร์โทรที่ติดต่อได้" required value={draft.phone} onChange={change}/></label></div>
        <label className={s.field}>วิธีรับอาหาร<select name="method" value={draft.method} onChange={change}><option value="pickup" disabled={settings?.pickup_enabled!==true}>รับเองที่ร้าน{settings?.pickup_enabled!==true?' · ไม่เปิดบริการ':''}</option>{zones.length>0&&<option value="delivery">จัดส่งในพื้นที่</option>}</select></label>
        {draft.method==='pickup'?<div className={s.notice}><MapPin size={18}/><strong>จุดรับอาหาร</strong><p>{display.pickup_address}</p></div>:<><label className={s.field}>พื้นที่จัดส่ง<select name="zone_id" value={draft.zone_id||''} onChange={change} required><option value="">เลือกพื้นที่จัดส่ง</option>{zones.map(zone=><option value={zone.id} key={zone.id}>{zone.name} · {foodPrice(zone.fee)}</option>)}</select></label><label className={s.field}>ที่อยู่จัดส่ง<textarea name="address" autoComplete="street-address" required maxLength={1000} value={draft.address||''} onChange={change}/></label></>}
        <label className={s.field}><span><Clock size={16} style={{display:'inline'}}/> วันและเวลารับอาหาร (เวลาประเทศไทย)</span><input type="datetime-local" name="scheduled_at" required value={draft.scheduled_at} onChange={change}/></label><p className={s.small}>จันทร์–ศุกร์ · เตรียมอย่างน้อย {display.prep_minutes} นาที · ร้านตรวจสอบเวลาทำการและคิวว่างก่อนรับออร์เดอร์</p>
        <label className={s.field}>หมายเหตุถึงครัว<textarea name="notes" maxLength={1000} placeholder="เช่น ไม่ใส่ผัก หรือข้อมูลแพ้อาหาร" value={draft.notes||''} onChange={change}/></label>
      </fieldset><p className={s.small}><ShieldCheck size={15} style={{display:'inline'}}/> ใช้ชื่อและเบอร์โทรเพื่อดำเนินการออร์เดอร์ ข้อมูลร่างเก็บไว้บนอุปกรณ์นี้สำหรับลองส่งซ้ำ</p><button type="submit" className={s.button} disabled={(!open&&!pendingSubmission)||busy}>{busy?'กำลังส่งออร์เดอร์…':pendingSubmission?'ตรวจสอบและส่งออร์เดอร์เดิมอีกครั้ง':'ส่งออร์เดอร์ให้ร้านยืนยัน'}</button><p className={s.small}>ยังไม่มีการเรียกเก็บเงินออนไลน์ กรุณาชำระตามที่ร้านยืนยัน</p></form>
    </div>}
  </main>;
}
