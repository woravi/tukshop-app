export class FoodError extends Error {
  constructor(message,code='INVALID_INPUT',status=400) { super(message); this.code=code; this.status=status; }
}
export const fail = (message,code='INVALID_INPUT',status=400) => {throw new FoodError(message,code,status);};
export const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export const text = (v,key,max=255,required=false) => {
  if (typeof v !== 'string' || v.length>max || (required && !v.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)) fail(`Invalid ${key}`);
  return v.trim();
};
export const integer = (v,key,min=0,max=1000000) => {if (!Number.isSafeInteger(v)||v<min||v>max) fail(`Invalid ${key}`); return v;};
export const bool = (v,key) => {if (typeof v!=='boolean') fail(`Invalid ${key}`); return v;};
export const DEFAULT_SETTINGS = {timezone:'Asia/Bangkok',weekdays:[1,2,3,4,5],order_accepting:false,pickup_enabled:true,delivery_enabled:true,hours:Object.fromEntries([1,2,3,4,5].map(d=>[d,{open:'',close:'18:00'}])),pickup_address:'บ้าน ทุ่งประดู่',delivery_zones:[],prep_minutes:20,daily_capacity:0};
export function toSatang(v,key='price') {
  if ((typeof v!=='number' && typeof v!=='string') || !/^\d+(\.\d{1,2})?$/.test(String(v))) fail(`Invalid ${key}`);
  const [whole,fraction='']=String(v).split('.');
  const amount=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  return integer(amount,key,0,100000000);
}
export function validateSettings(v) {
  if (!object(v)) fail('Invalid settings');
  if (v.timezone!=='Asia/Bangkok'||JSON.stringify(v.weekdays)!=='[1,2,3,4,5]') fail('Invalid timezone/weekdays');
  const s={timezone:'Asia/Bangkok',weekdays:[1,2,3,4,5],order_accepting:bool(v.order_accepting,'order_accepting'),pickup_enabled:bool(v.pickup_enabled,'pickup_enabled'),delivery_enabled:bool(v.delivery_enabled,'delivery_enabled'),hours:{},pickup_address:text(v.pickup_address,'pickup_address',1000),delivery_zones:[],prep_minutes:integer(v.prep_minutes,'prep_minutes',0,1440),daily_capacity:integer(v.daily_capacity,'daily_capacity',0,100000)};
  if (!object(v.hours)) fail('Invalid hours');
  for (const [d,h] of Object.entries(v.hours)) {
    const time=value=>typeof value==='string'&&(value===''||/^([01]\d|2[0-3]):[0-5]\d$/.test(value));
    if (!/^[1-5]$/.test(d)||!object(h)||!time(h.open)||!time(h.close)||(h.open&&h.close&&h.open>=h.close)) fail('Invalid hours');
    s.hours[d]={open:h.open,close:h.close};
  }
  if (!Array.isArray(v.delivery_zones)||v.delivery_zones.length>50) fail('Invalid delivery_zones');
  const seen=new Set();
  s.delivery_zones=v.delivery_zones.map(z=>{
    if (!object(z)||typeof z.id!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(z.id)||seen.has(z.id)) fail('Invalid delivery_zones');
    seen.add(z.id);
    return {id:z.id,name:text(z.name,'zone name',120,true),fee:toSatang(z.fee,'zone fee')/100,enabled:bool(z.enabled,'zone enabled')};
  });
  if (s.order_accepting) {
    if (Object.keys(s.hours).length!==5||Object.values(s.hours).some(h=>!h.open||!h.close)) fail('Configure weekday hours');
    if (!s.prep_minutes) fail('Configure prep_minutes');
    if (!s.daily_capacity) fail('Configure daily_capacity');
    if (!s.pickup_enabled&&!s.delivery_enabled) fail('Enable a fulfilment method');
    if (s.pickup_enabled&&!s.pickup_address) fail('Configure pickup_address');
    if (s.delivery_enabled&&!s.delivery_zones.some(z=>z.enabled)) fail('Configure delivery_zones');
  }
  return s;
}
const optionId = v => {if (typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(v)) fail('Invalid options id'); return v;};
export function validateMenu(v) {
  if (!object(v)) fail('Invalid menu');
  if (!['made_to_order','resale'].includes(v.source_type)) fail('Invalid source_type');
  if (v.image_url!==null && (typeof v.image_url!=='string'||!/^\/api\/images\/[1-9]\d{0,15}$/.test(v.image_url))) fail('Invalid image_url');
  const m={name:text(v.name,'name',160,true),description:text(v.description??'','description',2000),category:text(v.category,'category',120,true),image_url:v.image_url,price:toSatang(v.price)/100,source_type:v.source_type,available:bool(v.available,'available'),daily_limit:v.daily_limit===null?null:integer(v.daily_limit,'daily_limit',0,100000),stock:integer(v.stock??0,'stock'),allergens:text(v.allergens??'','allergens',1000),allergens_confirmed:bool(v.allergens_confirmed??false,'allergens_confirmed'),options:[]};
  if (!Array.isArray(v.options)||v.options.length>10) fail('Invalid options');
  const groups=new Set();
  m.options=v.options.map(g=>{
    if (!object(g)||groups.has(g.id)) fail('Invalid options');
    const id=optionId(g.id); groups.add(id);
    if (!Array.isArray(g.choices)||!g.choices.length||g.choices.length>30) fail('Invalid options choices');
    const min=integer(g.min,'options min',0,30),max=integer(g.max,'options max',min,g.choices.length),seen=new Set();
    const choices=g.choices.map(c=>{
      if (!object(c)||seen.has(c.id)) fail('Invalid options');
      const id=optionId(c.id); seen.add(id);
      return {id,name:text(c.name,'options name',120,true),price_adjustment:toSatang(c.price_adjustment,'options price')/100,available:bool(c.available,'options available')};
    });
    if (choices.filter(c=>c.available).length<min) fail('Invalid options availability');
    return {id,name:text(g.name,'options name',120,true),min,max,choices};
  });
  return m;
}
export function priceLine(menu,line) {
  if (!menu.available||menu.deleted) fail('Menu unavailable','UNAVAILABLE',409);
  const quantity=integer(line.quantity,'quantity',1,50);
  if (!Array.isArray(line.options)||line.options.length>10) fail('Invalid options');
  const selections=new Map();
  for (const g of line.options) {
    if (!object(g)||selections.has(g.group_id)||!menu.options.some(o=>o.id===g.group_id)||!Array.isArray(g.choice_ids)||new Set(g.choice_ids).size!==g.choice_ids.length) fail('Invalid options');
    selections.set(g.group_id,g.choice_ids);
  }
  let adjustment=0;
  const options=[];
  for (const g of menu.options) {
    const ids=selections.get(g.id)??[];
    if (ids.length<g.min||ids.length>g.max) fail('Invalid options selection');
    const choices=ids.map(id=>{const c=g.choices.find(c=>c.id===id&&c.available); if (!c) fail('Invalid options choice'); return c;});
    const satang=choices.reduce((sum,c)=>sum+toSatang(c.price_adjustment),0);
    adjustment+=satang;
    if (ids.length) options.push({group_id:g.id,group_name:g.name,choice_ids:ids,choice_names:choices.map(c=>c.name),price_adjustment:satang/100});
  }
  const unit_satang=toSatang(menu.price)+adjustment;
  integer(unit_satang,'unit price',0,100000000);
  return {menu_id:String(menu.id),name:menu.name,quantity,options,source_type:menu.source_type,unit_satang,total_satang:unit_satang*quantity};
}
export function foodId(v) {if (!['string','number'].includes(typeof v)||!/^([1-9]\d{0,15})$/.test(String(v))||!Number.isSafeInteger(Number(v))) fail('Invalid id'); return String(v);}
export function validateOrderInput(v) {
  if (!object(v)) fail('Invalid order');
  const allowed=['customer_name','phone','method','scheduled_at','address','zone_id','lines','notes','client_request_id'];
  if (Object.keys(v).some(k=>!allowed.includes(k))) fail('Unknown order field');
  if (typeof v.client_request_id!=='string'||!/^[A-Za-z0-9_-]{32,128}$/.test(v.client_request_id)) fail('Invalid client_request_id');
  const phone=text(v.phone,'phone',30,true);
  if (!/^\+?[\d ()-]{7,25}$/.test(phone)||phone.replace(/\D/g,'').length<7) fail('Invalid phone');
  if (!['pickup','delivery'].includes(v.method)) fail('Invalid method');
  const address=text(v.address??'','address',1500,v.method==='delivery');
  if (v.method==='pickup'&&(address||v.zone_id)) fail('Pickup must not include delivery address/zone');
  const zone_id=v.method==='delivery'?text(v.zone_id,'zone_id',64,true):null;
  if (!Array.isArray(v.lines)||v.lines.length<1||v.lines.length>30) fail('Invalid lines');
  let total=0;
  const lines=v.lines.map(l=>{
    if (!object(l)) fail('Invalid line');
    const menu_id=foodId(l.menu_id),quantity=integer(l.quantity,'quantity',1,50);
    if (!Array.isArray(l.options)||l.options.length>10) fail('Invalid options');
    const options=l.options.map(g=>{
      if (!object(g)||!Array.isArray(g.choice_ids)||g.choice_ids.length>30) fail('Invalid options');
      return {group_id:optionId(g.group_id),choice_ids:g.choice_ids.map(optionId)};
    });
    total+=quantity;
    return {menu_id,quantity,options};
  });
  if (total>100) fail('Invalid total quantity');
  return {customer_name:text(v.customer_name,'customer_name',120,true),phone,method:v.method,scheduled_at:text(v.scheduled_at,'scheduled_at',40,true),address,zone_id,lines,notes:text(v.notes??'','notes',1000),client_request_id:v.client_request_id};
}
export function validateTransition(order,patch,role) {
  if (!['owner','manager','kitchen'].includes(role)) fail('Forbidden','FORBIDDEN',403);
  if (!object(patch)||!Object.keys(patch).length||Object.keys(patch).some(k=>!['status','payment_status'].includes(k))) fail('Invalid update fields');
  const status=patch.status??order.status,payment_status=patch.payment_status??order.payment_status;
  if ('payment_status' in patch) {
    if (role==='kitchen') fail('Forbidden','FORBIDDEN',403);
    if (payment_status!=='paid') fail('Only manual paid confirmation is supported');
  }
  const next={pending:['accepted','rejected'],accepted:['preparing'],preparing:['ready'],ready:['completed'],rejected:[],cancelled:[],completed:[]};
  if (status==='cancelled'&&status!==order.status&&role==='kitchen') fail('Forbidden','FORBIDDEN',403);
  if (status!==order.status && !(next[order.status]?.includes(status)||status==='cancelled'&&['pending','accepted','preparing','ready'].includes(order.status)&&role!=='kitchen')) fail('Invalid lifecycle transition','INVALID_TRANSITION',409);
  return {status,payment_status,release:status!==order.status&&['rejected','cancelled'].includes(status)};
}
export function bangkokParts(date=new Date()) {
  const d=new Date(date.getTime()+7*60*60*1000);
  return {date:d.toISOString().slice(0,10),weekday:d.getUTCDay(),time:d.toISOString().slice(11,16)};
}
export function checkSchedule(settings,body,now=new Date()) {
  const s=publicSettings(settings), current=bangkokParts(now);
  const closed=()=>fail('Restaurant closed or not configured','CLOSED',409);
  if (!s.order_accepting||!s.configured||!s.weekdays.includes(current.weekday)) closed();
  const today=s.hours[current.weekday];
  if (!today||current.time<today.open||current.time>=today.close) closed();
  if (!['pickup','delivery'].includes(body.method)) fail('Invalid method');
  if (!s[`${body.method}_enabled`]) closed();
  const raw=body.scheduled_at;
  const match=typeof raw==='string'&&raw.match(/^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d{1,3})?(Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/);
  if (!match) fail('Invalid scheduled_at (timezone required)');
  const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
  if (month<1||month>12||day<1||day>new Date(Date.UTC(year,month,0)).getUTCDate()) fail('Invalid scheduled_at');
  const date=new Date(raw);
  if (!Number.isFinite(date.getTime())||date.getTime()<now.getTime()+s.prep_minutes*60000||date.getTime()>now.getTime()+7*86400000) fail('Invalid scheduled_at (lead time/horizon)');
  const target=bangkokParts(date),hours=s.hours[target.weekday];
  if (!s.weekdays.includes(target.weekday)||!hours||target.time<hours.open||target.time>=hours.close) closed();
  let delivery_satang=0;
  if (body.method==='delivery') {
    const zone=s.delivery_zones.find(z=>z.id===body.zone_id&&z.enabled);
    if (!zone) fail('Invalid delivery zone');
    delivery_satang=toSatang(zone.fee);
  }
  return {service_date:target.date,scheduled_at:date.toISOString(),delivery_satang};
}
export function publicSettings(v,now=new Date()) {
  const s=validateSettings(v);
  let configured=true;
  try {validateSettings({...s,order_accepting:true});} catch {configured=false;}
  const current=bangkokParts(now),hours=s.hours[current.weekday];
  const accepting_now=Boolean(s.order_accepting&&configured&&s.weekdays.includes(current.weekday)&&hours&&current.time>=hours.open&&current.time<hours.close);
  return {...s,configured,accepting_now,online_payment_enabled:false};
}
