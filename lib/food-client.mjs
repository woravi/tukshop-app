export const FOOD_CATEGORIES = ['ตามสั่ง', 'อาหารกล่อง', 'ขนม', 'ของทานเล่น'];
export const FOOD_STATUSES = {pending:'รอร้านยืนยัน',accepted:'รับออร์เดอร์แล้ว',preparing:'กำลังปรุง',ready:'พร้อมรับ / พร้อมส่ง',completed:'เสร็จสิ้น',rejected:'ร้านไม่สามารถรับออร์เดอร์',cancelled:'ยกเลิกแล้ว'};
export function isOrderingOpen(settings) { return settings?.order_accepting === true && settings?.configured === true && settings?.accepting_now === true; }
export function foodPrice(value) { return new Intl.NumberFormat('th-TH', {style:'currency',currency:'THB',maximumFractionDigits:2,minimumFractionDigits:0}).format(Number(value) || 0); }
export function localFoodImage(value) { return typeof value === 'string' && /^\/api\/images\/[a-zA-Z0-9_-]+$/.test(value) ? value : null; }
// Explicit owner-supplied facts; never infer an opening time or a fee.
export function foodSettingsDisplay(settings={}) {
 const raw=settings||{},hours={};
 for(const day of [1,2,3,4,5])hours[day]={open:raw.hours?.[day]?.open||'',close:raw.hours?.[day]?.close||'18:00'};
 return {...raw,hours,pickup_address:raw.pickup_address?.trim()||'บ้าน ทุ่งประดู่',prep_minutes:Number(raw.prep_minutes)>0?Number(raw.prep_minutes):20,delivery_zones:Array.isArray(raw.delivery_zones)?raw.delivery_zones:[]};
}
export function foodSettingsPayload(draft) {
 const zones=(draft.delivery_zones||[]).map(zone=>{
  if(zone.fee===''||zone.fee==null||!Number.isFinite(Number(zone.fee))||Number(zone.fee)<0)throw new Error('กรุณาระบุค่าจัดส่งจริงทุกพื้นที่ หากยังไม่ทราบให้ลบพื้นที่ออกก่อน ไม่ถือว่าจัดส่งฟรี');
  return {id:zone.id,name:zone.name,fee:Number(zone.fee),enabled:zone.enabled===true};
 });
 const hours=Object.fromEntries(Object.entries(draft.hours||{}).map(([day,hours])=>[day,{open:hours.open,close:hours.close}]));
 return {timezone:'Asia/Bangkok',weekdays:[1,2,3,4,5],order_accepting:draft.order_accepting===true,pickup_enabled:draft.pickup_enabled===true,delivery_enabled:draft.delivery_enabled===true,hours,pickup_address:draft.pickup_address||'',delivery_zones:zones,prep_minutes:Number(draft.prep_minutes||0),daily_capacity:Number(draft.daily_capacity||0),online_payment_enabled:false};
}
export function canAddFoodMenu(menu) {return menu?.available===true && Number.isFinite(Number(menu.price)) && Number(menu.price)>=0 && (menu.source_type!=='resale'||Number(menu.stock)>0);}
export function foodSelection(menu,selected={}) {
 let price=Number(menu.price),valid=true;const options=[],labels=[];
 for(const group of menu.options||[]){
  const ids=selected[group.id]||[],choices=ids.map(id=>group.choices.find(choice=>choice.id===id));
  if(ids.length<group.min||ids.length>group.max||new Set(ids).size!==ids.length||choices.some(choice=>!choice||choice.available===false))valid=false;
  if(ids.length){options.push({group_id:group.id,choice_ids:[...ids]});labels.push(`${group.name}: ${choices.filter(Boolean).map(choice=>choice.name).join(', ')}`);price+=choices.filter(Boolean).reduce((sum,choice)=>sum+Number(choice.price_adjustment||0),0);}
 }
 return {price,valid,options,options_label:labels.join(' · ')};
}
export async function foodRequest(url,init={},transport=globalThis.fetch) {
  const response = await transport(url,{cache:'no-store',...init,headers:{...(init.body instanceof FormData?{}:{'Content-Type':'application/json'}),...init.headers}});
  let data;
  try {data=await response.json();} catch {throw new Error('ไม่สามารถอ่านข้อมูลจากร้าน กรุณาลองอีกครั้ง');}
  if (!response.ok) {const error=new Error(data.error || data.message || 'ไม่สามารถดำเนินการได้ กรุณาลองอีกครั้ง');error.status=response.status;error.code=data.code;throw error;}
  return data;
}
export function orderPayload(draft,items,requestId) {
  return {customer_name:draft.customer_name.trim(),phone:draft.phone.trim(),method:draft.method,scheduled_at:draft.scheduled_at ? `${draft.scheduled_at}:00+07:00` : null,address:draft.method==='delivery'?draft.address?.trim():null,zone_id:draft.method==='delivery'?draft.zone_id:null,notes:draft.notes?.trim()||'',client_request_id:requestId,lines:items.map(({menu_id,quantity,options})=>({menu_id,quantity,options}))};
}
export async function submitFoodOrder(payload,transport=globalThis.fetch) {
  const result=await foodRequest('/api/food/orders',{method:'POST',body:JSON.stringify(payload)},transport);
  if (!result.order?.id || typeof result.tracking_token!=='string' || !/^[a-f0-9]{64}$/.test(result.tracking_token)) throw new Error('ยังไม่ได้รับการยืนยันออร์เดอร์ กรุณาลองอีกครั้งด้วยรายการเดิม');
  return result;
}
