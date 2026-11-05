import test from 'node:test';
import assert from 'node:assert/strict';
const domain = await import('../lib/food-domain.mjs').catch(() => ({}));
const menu = {id:'1',name:'ข้าวกะเพรา',description:'',category:'อาหารจานเดียว',image_url:null,price:60.10,source_type:'made_to_order',available:true,daily_limit:5,stock:0,allergens:'',allergens_confirmed:false,options:[{id:'egg',name:'ไข่',min:1,max:1,choices:[{id:'fried',name:'ไข่ดาว',price_adjustment:10.20,available:true}]}]};
test('menu and order lines validate selections and compute exact satang without trusting cart prices', () => {
  assert.equal(typeof domain.validateMenu,'function');
  const m=domain.validateMenu(menu);
  assert.equal(m.price,60.1);
  assert.throws(()=>domain.validateMenu({...menu,image_url:'https://foo/bar'}),/image_url/);
  assert.throws(()=>domain.validateMenu({...menu,price:1.234}),/price/);
  assert.throws(()=>domain.validateMenu({...menu,stock:-1}),/stock/);
  assert.throws(()=>domain.validateMenu({...menu,source_type:'other'}),/source_type/);
  assert.throws(()=>domain.validateMenu({...menu,options:[...menu.options,...menu.options]}),/options/);
  const line=domain.priceLine({...menu,id:'1'}, {menu_id:'1',quantity:3,options:[{group_id:'egg',choice_ids:['fried']}],price:0});
  assert.equal(line.unit_satang,7030);
  assert.equal(line.total_satang,21090);
  assert.throws(()=>domain.priceLine(menu,{menu_id:'1',quantity:1,options:[]}),/options/);
  assert.throws(()=>domain.priceLine(menu,{menu_id:'1',quantity:1,options:[{group_id:'egg',choice_ids:['fried','fried']}]}),/options/);
  assert.throws(()=>domain.priceLine({...menu,available:false},{quantity:1,options:[]}),e=>e.code==='UNAVAILABLE');
});
test('schedule uses Bangkok weekdays, open submission hours, lead time, fixed zones and finite horizon', () => {
  assert.equal(typeof domain.checkSchedule,'function');
  const now=new Date('2026-11-05T03:00:00Z'); // Thu 10:00 Bangkok
  const body={method:'pickup',scheduled_at:'2026-11-05T12:00:00+07:00'};
  assert.equal(domain.checkSchedule(settings,body,now).service_date,'2026-11-05');
  assert.equal(domain.checkSchedule(settings,{...body,method:'delivery',zone_id:'local'},now).delivery_satang,2000);
  for (const scheduled_at of ['2026-11-07T12:00:00+07:00','2026-11-05T10:10:00+07:00','2026-11-05T18:00:00+07:00','2026-11-13T12:00:00+07:00','2026-11-05T12:00:00','2026-02-30T12:00:00+07:00']) assert.throws(()=>domain.checkSchedule(settings,{...body,scheduled_at},now));
  assert.throws(()=>domain.checkSchedule({...settings,order_accepting:false},body,now),e=>e.code==='CLOSED');
  assert.throws(()=>domain.checkSchedule(settings,body,new Date('2026-11-07T03:00:00Z')),e=>e.code==='CLOSED');
  assert.throws(()=>domain.checkSchedule(settings,body,new Date('2026-11-05T01:00:00Z')),e=>e.code==='CLOSED');
  assert.throws(()=>domain.checkSchedule(settings,{...body,method:'delivery',zone_id:'unknown'},now),/zone/);
});
test('order input and lifecycle enforce opaque keys, PII limits, and manual payment authorization', () => {
  assert.equal(typeof domain.validateOrderInput,'function');
  const input={customer_name:'ผู้รับ',phone:'0812345678',method:'pickup',scheduled_at:'2026-11-05T12:00:00+07:00',lines:[{menu_id:'1',quantity:1,options:[]}],client_request_id:'0123456789abcdef0123456789abcdef'};
  assert.equal(domain.validateOrderInput(input).address,'');
  assert.throws(()=>domain.validateOrderInput({...input,client_request_id:'phone'}),/client_request_id/);
  assert.throws(()=>domain.validateOrderInput({...input,phone:'not a phone'}),/phone/);
  assert.throws(()=>domain.validateOrderInput({...input,method:'delivery'}),/address/);
  assert.throws(()=>domain.validateOrderInput({...input,lines:[{menu_id:'1',quantity:0,options:[]}]}),/quantity/);
  assert.throws(()=>domain.validateOrderInput({...input,lines:[{menu_id:'1',quantity:1,options:null}]}),/options/);
  assert.throws(()=>domain.validateOrderInput({...input,total:1}),/field/);
  assert.deepEqual(domain.validateTransition({status:'pending',payment_status:'unpaid'}, {status:'accepted'},'kitchen'),{status:'accepted',payment_status:'unpaid',release:false});
  assert.equal(domain.validateTransition({status:'pending',payment_status:'unpaid'},{status:'rejected'},'kitchen').release,true);
  assert.throws(()=>domain.validateTransition({status:'pending',payment_status:'unpaid'},{status:'completed'},'owner'),e=>e.code==='INVALID_TRANSITION');
  assert.throws(()=>domain.validateTransition({status:'pending',payment_status:'unpaid'},{payment_status:'paid'},'kitchen'),e=>e.status===403);
  assert.throws(()=>domain.validateTransition({status:'pending',payment_status:'unpaid'},{status:'cancelled'},'kitchen'),e=>e.status===403);
  assert.equal(domain.validateTransition({status:'cancelled',payment_status:'unpaid'},{status:'cancelled'},'owner').release,false);
});
export const settings = {timezone:'Asia/Bangkok',weekdays:[1,2,3,4,5],order_accepting:true,pickup_enabled:true,delivery_enabled:true,hours:Object.fromEntries([1,2,3,4,5].map(d=>[d,{open:'09:00',close:'17:00'}])),pickup_address:'ร้าน ถนนหลัก',delivery_zones:[{id:'local',name:'เขตที่ร้านบริการ',fee:20,enabled:true}],prep_minutes:30,daily_capacity:100};
test('default settings retain only confirmed owner facts and remain unconfigured',()=>{
 const s=domain.DEFAULT_SETTINGS;
 assert.deepEqual(s.hours,Object.fromEntries([1,2,3,4,5].map(d=>[d,{open:'',close:'18:00'}])));
 assert.equal(s.pickup_address,'บ้าน ทุ่งประดู่');assert.equal(s.prep_minutes,20);
 assert.equal(s.daily_capacity,0);assert.deepEqual(s.delivery_zones,[]);
 const view=domain.publicSettings(s,new Date('2026-11-05T03:00:00Z'));
 assert.equal(view.order_accepting,false);assert.equal(view.configured,false);assert.equal(view.accepting_now,false);
});
test('partial hours permit only empty or valid times and stay closed until both times exist',()=>{
 const now=new Date('2026-11-05T03:00:00Z');
 for(const partial of [{open:'',close:'18:00'},{open:'09:00',close:''},{open:'',close:''}]){
  const draft={...settings,order_accepting:false,hours:{...settings.hours,4:partial}};
  assert.deepEqual(domain.validateSettings(draft).hours[4],partial);
  assert.equal(domain.publicSettings(draft,now).configured,false);
  assert.equal(domain.publicSettings(draft,now).accepting_now,false);
  assert.throws(()=>domain.validateSettings({...draft,order_accepting:true}),/hours/);
  assert.throws(()=>domain.checkSchedule(draft,{method:'pickup',scheduled_at:'2026-11-05T12:00:00+07:00'},now),e=>e.code==='CLOSED');
 }
 for(const hours of [{open:'25:00',close:''},{open:'',close:'18:90'},{open:null,close:'18:00'},{close:'18:00'},{open:'18:00',close:'09:00'},{open:'18:00',close:'18:00'}]){
  assert.throws(()=>domain.validateSettings({...settings,order_accepting:false,hours:{1:hours}}),/hours/);
 }
});
test('settings fail closed until explicit valid weekday configuration', () => {
  assert.equal(typeof domain.validateSettings,'function');
  assert.equal(domain.DEFAULT_SETTINGS.order_accepting,false);
  assert.equal(domain.publicSettings(domain.DEFAULT_SETTINGS).configured,false);
  assert.equal(domain.validateSettings(settings).order_accepting,true);
  assert.equal(domain.publicSettings(settings,new Date('2026-11-05T03:00:00Z')).accepting_now,true);
  assert.equal(domain.publicSettings(settings,new Date('2026-11-07T03:00:00Z')).accepting_now,false);
  assert.equal(domain.publicSettings(settings,new Date('2026-11-05T12:00:00Z')).accepting_now,false);
  assert.throws(()=>domain.validateSettings({...settings,pickup_address:''}),/pickup_address/);
  assert.throws(()=>domain.validateSettings({...settings,hours:{}}),/hours/);
  assert.throws(()=>domain.validateSettings({...settings,weekdays:[0,1,2,3,4]}),/weekdays/);
  assert.throws(()=>domain.validateSettings({...settings,prep_minutes:0}),/prep_minutes/);
});
