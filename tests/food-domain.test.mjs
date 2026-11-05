import test from 'node:test';
import assert from 'node:assert/strict';

test('food storefront fails closed unless backend explicitly opens ordering', async () => {
  const {isOrderingOpen, foodPrice, localFoodImage} = await import('../lib/food-client.mjs');
  for (const value of [undefined, {}, {order_accepting:false}, {order_accepting:'true'}]) assert.equal(isOrderingOpen(value), false);
  assert.equal(isOrderingOpen({order_accepting:true}), false);
  assert.equal(isOrderingOpen({order_accepting:true,configured:true}), false);
  assert.equal(isOrderingOpen({order_accepting:true,configured:true,accepting_now:true}), true);
  assert.equal(foodPrice(45), '฿45');
  assert.equal(localFoodImage('https://external.invalid/meal.jpg'), null);
  assert.equal(localFoodImage('/api/images/42'), '/api/images/42');
});

test('API rejects failures and unconfirmed order success without clearing cart', async () => {
  const {foodRequest,submitFoodOrder,orderPayload} = await import('../lib/food-client.mjs');
  const payload = orderPayload({customer_name:' มาลี ',phone:'0812345678',method:'pickup',scheduled_at:'2026-11-06T12:00',notes:''},[{menu_id:'1',quantity:2,options:{spice:'น้อย'},price:1}], 'stable-key');
  assert.equal(payload.customer_name,'มาลี');
  assert.equal(payload.scheduled_at,'2026-11-06T12:00:00+07:00');
  assert.equal(payload.lines[0].price,undefined);
  assert.equal(payload.client_request_id,'stable-key');
  await assert.rejects(()=>foodRequest('/x',{},async()=>new Response(JSON.stringify({error:'ปิดรับออร์เดอร์',code:'CLOSED'}),{status:409})),error=>error.status===409&&error.code==='CLOSED');
  await assert.rejects(()=>submitFoodOrder(payload,async()=>Response.json({order:{id:'1'}})),/ยืนยัน/);
  await assert.rejects(()=>submitFoodOrder(payload,async()=>Response.json({tracking_token:'malformed',order:{id:'1'}})),/ยืนยัน/);
  const confirmed = await submitFoodOrder(payload,async(_url,init)=>{
    assert.equal(JSON.parse(init.body).client_request_id,'stable-key');
    return Response.json({tracking_token:'a'.repeat(64),order:{id:'1',status:'pending'}});
  });
  assert.equal(confirmed.tracking_token,'a'.repeat(64));
});
