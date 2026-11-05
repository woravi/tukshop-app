import test from 'node:test';
import assert from 'node:assert/strict';

test('food cart is separate, merges identical options, and preserves a retry key', async () => {
  const {default:useFoodCart} = await import('../store/foodCartStore.js');
  useFoodCart.setState({items:[],clientRequestId:null});
  const menu = {id:'1',name:'ผัดกะเพรา',price:55,available:true};
  const cart = () => useFoodCart.getState();
  assert.equal(cart().add(menu,{spice:'น้อย'}),true);
  cart().add(menu,{spice:'น้อย'});
  cart().add(menu,{spice:'มาก'});
  assert.equal(cart().items.length,2);
  assert.equal(cart().items[0].quantity,2);
  const key = cart().requestId();
  assert.ok(key);
  assert.equal(cart().requestId(),key);
  cart().update(cart().items[0].key,3);
  assert.equal(cart().clientRequestId,null);
  assert.notEqual(cart().requestId(),key);
  assert.equal(cart().add({...menu,available:false}),false);
  assert.equal(cart().add({...menu,price:-1}),false);
  cart().clear();
  assert.equal(cart().items.length,0);
  const {default:products} = await import('../store/cartStore.js');
  assert.notEqual(useFoodCart,products);
});

test('guest draft survives state updates but changing it invalidates prior submission key', async()=>{
  const {default:store}=await import('../store/foodCartStore.js');
  const key=store.getState().requestId();
  store.getState().setDraft({customer_name:'มาลี',phone:'0812345678'});
  assert.equal(store.getState().draft.customer_name,'มาลี');
  assert.equal(store.getState().clientRequestId,null);
  assert.notEqual(store.getState().requestId(),key);
});
