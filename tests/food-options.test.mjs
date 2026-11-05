import test from 'node:test';
import assert from 'node:assert/strict';

test('menu selections respect option cardinality, availability and show price additions without trusting client prices',async()=>{
 const {foodSelection,canAddFoodMenu}=await import('../lib/food-client.mjs');
 const menu={id:'1',price:50,available:true,source_type:'made_to_order',options:[{id:'egg',name:'ไข่',min:1,max:1,choices:[{id:'fried',name:'ไข่ดาว',price_adjustment:10,available:true},{id:'boiled',name:'ไข่ต้ม',price_adjustment:5,available:false}]}]};
 assert.equal(foodSelection(menu,{}).valid,false);
 assert.equal(foodSelection(menu,{egg:['boiled']}).valid,false);
 const selected=foodSelection(menu,{egg:['fried']});
 assert.equal(selected.valid,true);assert.equal(selected.price,60);assert.deepEqual(selected.options,[{group_id:'egg',choice_ids:['fried']}]);assert.equal(selected.options_label,'ไข่: ไข่ดาว');
 assert.equal(canAddFoodMenu({...menu,source_type:'resale',stock:0}),false);
 assert.equal(canAddFoodMenu({...menu,source_type:'resale',stock:2}),true);
});

test('cart enforces API quantity bounds and retains an immutable pending submission across uncertain retries',async()=>{
 const {default:store}=await import('../store/foodCartStore.js');store.setState({items:[],clientRequestId:null,pendingSubmission:null});
 const menu={id:'1',price:50,name:'ข้าว',available:true};store.getState().add(menu,[]);const key=store.getState().items[0].key;
 store.getState().update(key,50);assert.equal(store.getState().items[0].quantity,50);store.getState().update(key,51);assert.equal(store.getState().items[0].quantity,50);
 const payload={client_request_id:store.getState().requestId(),customer_name:'มาลี',lines:[{menu_id:'1',quantity:50,options:[]}]};
 store.getState().beginSubmission(payload);
 store.getState().setDraft({customer_name:'เปลี่ยน'});store.getState().update(key,1);
 assert.deepEqual(store.getState().pendingSubmission,payload);assert.equal(store.getState().items[0].quantity,50);
 assert.equal(store.getState().add(menu,[]),false);
 store.getState().releaseSubmission();store.getState().update(key,1);assert.equal(store.getState().items[0].quantity,1);
 store.getState().clear();
});
