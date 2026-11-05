'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {UtensilsCrossed,ShoppingBag,Plus,Leaf,ArrowRight} from 'lucide-react';
import useFoodCart from '../../store/foodCartStore';
import {FOOD_CATEGORIES,foodRequest,foodPrice,isOrderingOpen,localFoodImage,foodSelection,canAddFoodMenu} from '../../lib/food-client.mjs';
import s from './food.module.css';

function MenuCard({menu,open,onAdd}) {
  const [options,setOptions]=useState({});
  const image=localFoodImage(menu.image_url);
  const groups=Array.isArray(menu.options)?menu.options:[];
  const selection=foodSelection(menu,options);
  const available=canAddFoodMenu(menu);
  return <article className={s.card}>
    {image?<img className={s.image} src={image} alt={menu.name} loading="lazy"/>:<div className={s.noimage} aria-label="ยังไม่มีรูปเมนู"><UtensilsCrossed size={48} strokeWidth={1}/></div>}
    <div className={s.body}>
      <div className={s.meta}><span className={s.badge}>{menu.category}</span><span className={s.small}>{menu.source_type==='resale'?'รับมาจำหน่าย':'ปรุงตามออร์เดอร์'}</span>{!available&&<span className={s.badge}>หมดชั่วคราว</span>}</div>
      <h3>{menu.name}</h3><p className={s.description}>{menu.description}</p>
      {menu.allergens?.length>0&&<p className={s.small}>สารก่อภูมิแพ้: {menu.allergens}</p>}
      {menu.allergens_confirmed!==true&&<p className={s.small}>สอบถามร้านเรื่องสารก่อภูมิแพ้ก่อนสั่ง</p>}
      {menu.daily_limit!=null&&<p className={s.small}>จำกัด {menu.daily_limit} ที่ / วัน</p>}
      {groups.map(group=><div className={s.form} style={{gap:8,marginTop:12}} key={group.id}>{group.max===1?<label className={s.field}>{group.name}{group.min>0?' *':''}<select value={options[group.id]?.[0]||''} onChange={event=>setOptions({...options,[group.id]:event.target.value?[event.target.value]:[]})}><option value="">เลือก{group.name}</option>{group.choices.map(choice=><option key={choice.id} disabled={choice.available===false} value={choice.id}>{choice.name}{Number(choice.price_adjustment)?` (+${foodPrice(choice.price_adjustment)})`:''}{choice.available===false?' · หมด':''}</option>)}</select></label>:<fieldset style={{border:0,padding:0}}><legend>{group.name} · เลือก {group.min}–{group.max} รายการ</legend>{group.choices.map(choice=>{const ids=options[group.id]||[];return <label className={s.check} key={choice.id}><input type="checkbox" checked={ids.includes(choice.id)} disabled={choice.available===false||(!ids.includes(choice.id)&&ids.length>=group.max)} onChange={event=>setOptions({...options,[group.id]:event.target.checked?[...ids,choice.id]:ids.filter(id=>id!==choice.id)})}/>{choice.name}{Number(choice.price_adjustment)?` (+${foodPrice(choice.price_adjustment)})`:''}</label>;})}</fieldset>}</div>)}
      <div className={s.cardfoot}><span className={s.price}>{foodPrice(selection.price)}</span><button className={s.button} disabled={!open || !available || !selection.valid} aria-label={`เพิ่ม ${menu.name}`} onClick={()=>onAdd({...menu,price:selection.price,options_label:selection.options_label},selection.options)}><Plus size={17}/> เพิ่ม</button></div>
    </div>
  </article>;
}
export default function FoodMenu() {
  const [menu,setMenu]=useState([]),[settings,setSettings]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[category,setCategory]=useState('ทั้งหมด'),[search,setSearch]=useState(''),[notice,setNotice]=useState(''),[mounted,setMounted]=useState(false);
  const items=useFoodCart(state=>state.items),add=useFoodCart(state=>state.add);
  async function load(signal) {setLoading(true);setError('');try{const [records,config]=await Promise.all([foodRequest('/api/food/menu',{signal}),foodRequest('/api/food/settings',{signal})]);if(!Array.isArray(records.items))throw new Error('ข้อมูลเมนูไม่ถูกต้อง');setMenu(records.items);setSettings(config.settings);}catch(e){if(e.name!=='AbortError'){setError(e.message);setSettings(null);}}finally{setLoading(false);}}
  useEffect(()=>{setMounted(true);const controller=new AbortController();load(controller.signal);return()=>controller.abort();},[]);
  const deliveryZones=settings?.delivery_enabled===true&&Array.isArray(settings.delivery_zones)?settings.delivery_zones.filter(zone=>zone.enabled===true&&zone.fee!==''&&zone.fee!=null&&Number.isFinite(Number(zone.fee))&&Number(zone.fee)>=0):[];
  const serviceDays=(Array.isArray(settings?.weekdays)?settings.weekdays:Object.keys(settings?.hours||{})).map(Number).filter(day=>day>=0&&day<=6&&settings?.hours?.[day]?.open&&settings?.hours?.[day]?.close);
  const welcomeMenu=menu.find(item=>canAddFoodMenu(item)&&localFoodImage(item.image_url))||menu.find(item=>localFoodImage(item.image_url));
  const open=isOrderingOpen(settings), count=mounted?items.reduce((n,item)=>n+item.quantity,0):0;
  const visible=menu.filter(item=>(category==='ทั้งหมด'||item.category===category)&&`${item.name} ${item.description||''}`.toLowerCase().includes(search.toLowerCase()));
  function onAdd(item,options){setNotice(add(item,options)?`เพิ่ม ${item.name} ในตะกร้าแล้ว`:'ไม่สามารถเพิ่มรายการนี้ได้');}
  return <main className={s.shell}>
    <div className={s.top}><Link href="/food" className={s.brand}><span className={s.brandmark}><UtensilsCrossed size={23}/></span> ครัวรัชนี</Link><Link href="/food/cart" className={s.secondary}><ShoppingBag size={18}/> ตะกร้าอาหาร <span className={s.badge}>{count}</span></Link></div>
    <header className={s.welcome} aria-labelledby="food-welcome-title">
      <div className={s.welcomeIntro}>
        <p className={s.welcomeEyebrow}>เมนูอาหารจากครัวรัชนี</p>
        <h1 id="food-welcome-title" className={s.welcomeTitle}>ครัวรัชนี</h1>
        <p className={s.welcomeLead}>มื้อที่ชอบ เริ่มจากครัวเรา</p>
        <p className={s.welcomeCopy}>เลือกอาหารตามสั่ง อาหารกล่อง หรือของทานเล่น<br/>ดูรายละเอียดเมนู เลือกสิ่งที่ชอบ แล้วสั่งได้ในที่เดียว</p>
        <div className={s.welcomeActions}>
          <a href="#food-menu" className={s.welcomePrimary}>ดูเมนูและสั่งอาหาร <ArrowRight size={18} aria-hidden="true"/></a>
          <Link href="/food/cart" className={s.welcomeSecondary}><ShoppingBag size={18} aria-hidden="true"/> ดูตะกร้าอาหาร</Link>
        </div>
        <div className={s.welcomeSignature} aria-hidden="true"><span/> อิ่มง่าย ๆ ในแบบที่คุณเลือก</div>
      </div>
      <figure className={s.welcomeVisual}>
        {welcomeMenu?<><img className={s.welcomeImage} src={localFoodImage(welcomeMenu.image_url)} alt={welcomeMenu.name} fetchPriority="high"/><figcaption className={s.welcomeCaption}><span>จากเมนูของเรา</span><strong>{welcomeMenu.name}</strong><a href="#food-menu" aria-label={`ดูเมนู ${welcomeMenu.name}`}><ArrowRight size={21}/></a></figcaption></>:<div className={s.welcomePlaceholder}><UtensilsCrossed size={64} strokeWidth={1} aria-hidden="true"/><span>ครัวรัชนี</span><small>{loading?'กำลังเตรียมรายการเมนู…':'เลือกมื้อที่ชอบ จากเมนูด้านล่าง'}</small></div>}
      </figure>
      <aside className={s.welcomeService} aria-label="ข้อมูลการให้บริการ">
        <div><strong role="status">{loading?'กำลังตรวจสอบเวลารับออร์เดอร์':open?'เปิดรับออร์เดอร์':'ยังไม่เปิดรับออร์เดอร์'}</strong><p>{loading?'รอสักครู่ กำลังตรวจสอบข้อมูลจากร้าน':error?'ยังไม่สามารถตรวจสอบข้อมูลร้านได้ กรุณาลองอีกครั้ง':open?'เลือกเมนู แล้วตรวจสอบวิธีรับอาหารในตะกร้า':'เลือกดูเมนูได้ ร้านจะเปิดรับเมื่อพร้อมให้บริการ'}</p></div>
        <div>{!loading&&settings?<>{settings.pickup_enabled===true?<p className={s.small}>จุดรับอาหาร: {settings.pickup_address?.trim()||'สอบถามจุดรับอาหารจากร้าน'}</p>:<p className={s.small}>ยังไม่เปิดบริการรับเอง</p>}{Number(settings.prep_minutes)>0&&<p className={s.small}>เตรียมอาหารอย่างน้อย {Number(settings.prep_minutes)} นาที</p>}</>:<p className={s.small}>รายละเอียดการรับอาหารรอการยืนยันจากร้าน</p>}</div>
        <div>{!loading&&settings&&<>{serviceDays.length>0?<details className={s.small}><summary>เวลาให้บริการ</summary>{serviceDays.map(day=><p key={day}>{['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][day]}: {settings.hours[day].open} – {settings.hours[day].close} น.</p>)}</details>:<p className={s.small}>เวลาให้บริการรอการยืนยันจากร้าน</p>}{deliveryZones.length>0?deliveryZones.map(zone=><p className={s.small} key={zone.id||zone.name}>จัดส่ง {zone.name} · {foodPrice(zone.fee)}</p>):<p className={s.small}>ยังไม่เปิดบริการจัดส่ง</p>}</>}</div>
      </aside>
    </header>
    {error&&<div className={s.error} role="alert">{error} <button className={s.secondary} onClick={()=>load()}>ลองอีกครั้ง</button></div>}
    <div id="food-menu" tabIndex={-1} className={`${s.toolbar} ${s.welcomeMenuTarget}`}><nav className={s.nav} aria-label="หมวดอาหาร">{['ทั้งหมด',...FOOD_CATEGORIES].map(name=><button key={name} aria-pressed={category===name} className={`${s.chip} ${category===name?s.active:''}`} onClick={()=>setCategory(name)}>{name}</button>)}</nav><input className={s.search} style={{maxWidth:230}} aria-label="ค้นหาเมนู" placeholder="ค้นหาเมนูที่อยากทาน…" value={search} onChange={event=>setSearch(event.target.value)}/></div>
    <div className={s.toolbar}><h2>{category==='ทั้งหมด'?'เมนูจากครัว':category}</h2><span className={s.small}>{visible.length} เมนู <Leaf size={13} style={{display:'inline'}}/></span></div>
    <p role="status" className={s.small} aria-live="polite">{notice}</p>
    {loading?<div className={s.empty} role="status">กำลังเตรียมรายการเมนู…</div>:visible.length?<div className={s.grid}>{visible.map(item=><MenuCard key={item.id} menu={item} open={open} onAdd={onAdd}/>)}</div>:<div className={s.empty}><h3>{search?'ไม่พบเมนูที่ค้นหา':'ยังไม่มีเมนูในหมวดนี้'}</h3><p className={s.muted}>กลับมาเลือกเมนูอร่อยได้ใหม่อีกครั้ง</p></div>}
    {count>0&&<Link href="/food/cart" className={`${s.button} ${s.mobilecart}`}><ShoppingBag size={18}/> ดูตะกร้าอาหาร · {count} รายการ <ArrowRight size={18}/></Link>}
  </main>;
}
