import test from 'node:test';
import assert from 'node:assert/strict';

test('owner-supplied closing time prep and pickup are visible without inventing opening hours or delivery fees',async()=>{
 const {foodSettingsDisplay,isOrderingOpen,foodSettingsPayload}=await import('../lib/food-client.mjs');
 const view=foodSettingsDisplay({order_accepting:false,configured:false,accepting_now:false,pickup_enabled:true,delivery_enabled:true,hours:{},pickup_address:'',prep_minutes:0,daily_capacity:0,delivery_zones:[]});
 assert.equal(view.pickup_address,'บ้าน ทุ่งประดู่');assert.equal(view.prep_minutes,20);
 for(const day of [1,2,3,4,5]){assert.equal(view.hours[day].open,'');assert.equal(view.hours[day].close,'18:00');}
 assert.deepEqual(view.delivery_zones,[]);assert.equal(isOrderingOpen(view),false);
 const payload=foodSettingsPayload(view);const {validateSettings}=await import('../lib/food-domain.mjs');assert.doesNotThrow(()=>validateSettings(payload));assert.deepEqual(payload.hours,view.hours);assert.equal(payload.prep_minutes,20);assert.equal(payload.pickup_address,'บ้าน ทุ่งประดู่');assert.equal(payload.order_accepting,false);
 assert.throws(()=>foodSettingsPayload({...view,delivery_zones:[{id:'zone',name:'พื้นที่',fee:'',enabled:true}]}),/ค่าจัดส่ง/);
 const persisted=foodSettingsDisplay({...view,pickup_address:'ที่อยู่จาก API',prep_minutes:35,hours:{1:{open:'10:00',close:'17:30'}}});assert.equal(persisted.pickup_address,'ที่อยู่จาก API');assert.equal(persisted.prep_minutes,35);assert.equal(persisted.hours[1].close,'17:30');
});
