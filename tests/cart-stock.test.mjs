import test from 'node:test';
import assert from 'node:assert/strict';
import useCartStore from '../store/cartStore.js';

test('cart rejects sold out products and caps additions at known stock', () => {
  useCartStore.setState({items: []});
  const cart = useCartStore.getState();
  cart.addItem({_id:'sold', stock:0});
  assert.equal(useCartStore.getState().items.length, 0);
  cart.addItem({_id:'a', stock:2});
  cart.addItem({_id:'a', stock:2});
  cart.addItem({_id:'a', stock:2});
  assert.equal(useCartStore.getState().items[0].quantity, 2);
});

 test('stale cart cannot increment when stock is absent', () => {
  useCartStore.setState({items:[{_id:'old', quantity:2}]});
  useCartStore.getState().updateItemQuantity('old',3);
  assert.equal(useCartStore.getState().items[0].quantity,2);
  useCartStore.getState().updateItemQuantity('old',1);
  assert.equal(useCartStore.getState().items[0].quantity,1);
});

test('product stock status distinguishes unavailable from sold out', async () => {
  const {stockLabel} = await import('../lib/stock.mjs');
  assert.equal(stockLabel({stock:0}), 'Sold out');
  assert.equal(stockLabel({}), 'Stock unavailable');
  assert.equal(stockLabel({stock:2}), 'In stock: 2');
});

 test('latest product stock refresh blocks further additions and cart increments', () => {
  useCartStore.setState({items:[{_id:'a', stock:5, quantity:2}]});
  assert.equal(useCartStore.getState().addItem({_id:'a', stock:1}), false);
  useCartStore.getState().updateItemQuantity('a',3);
  assert.equal(useCartStore.getState().items[0].quantity,2);
  assert.equal(useCartStore.getState().items[0].stock,1);
});

test('missing or malformed stock cannot be added', () => {
  useCartStore.setState({items:[]});
  for (const stock of [undefined, null, -1, 1.5, '2']) {
    assert.equal(useCartStore.getState().addItem({_id:String(stock), stock}), false);
  }
  assert.equal(useCartStore.getState().items.length,0);
});
