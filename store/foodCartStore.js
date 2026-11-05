import {create} from 'zustand';
import {persist,createJSONStorage} from 'zustand/middleware';
import {canAddFoodMenu} from '../lib/food-client.mjs';
const storage = {getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const blankDraft=()=>({customer_name:'',phone:'',method:'pickup',scheduled_at:'',address:'',zone_id:'',notes:''});
const useFoodCart = create(persist((set,get)=>({
 items:[],clientRequestId:null,pendingSubmission:null,draft:blankDraft(),
 setDraft(patch){if(get().pendingSubmission)return;set(state=>({draft:{...state.draft,...patch},clientRequestId:null}));},
 add(menu,options=[]){
  if(get().pendingSubmission||!canAddFoodMenu(menu))return false;
  const normalized=Array.isArray(options)?options.map(group=>({...group,choice_ids:[...group.choice_ids].sort()})).sort((a,b)=>a.group_id.localeCompare(b.group_id)):Object.fromEntries(Object.entries(options).sort());
  const key=`${menu.id}:${JSON.stringify(normalized)}`,items=get().items,existing=items.find(item=>item.key===key),total=items.reduce((sum,item)=>sum+item.quantity,0);
  const menuQuantity=items.filter(item=>String(item.menu_id)===String(menu.id)).reduce((sum,item)=>sum+item.quantity,0);
  if((existing?.quantity||0)>=50||total>=100||(!existing&&items.length>=30)||(menu.source_type==='resale'&&menuQuantity>=Number(menu.stock)))return false;
  set({items:existing?items.map(item=>item.key===key?{...item,price:Number(menu.price),quantity:item.quantity+1}:item):[...items,{key,menu_id:menu.id,name:menu.name,price:Number(menu.price),image_url:menu.image_url,options:normalized,options_label:menu.options_label||'',quantity:1}],clientRequestId:null});return true;
 },
 update(key,quantity){if(get().pendingSubmission||!Number.isInteger(quantity)||quantity<0||quantity>50)return;const items=get().items;if(items.reduce((sum,item)=>sum+(item.key===key?quantity:item.quantity),0)>100)return;set({items:quantity===0?items.filter(item=>item.key!==key):items.map(item=>item.key===key?{...item,quantity}:item),clientRequestId:null});},
 requestId(){if(!get().clientRequestId)set({clientRequestId:globalThis.crypto.randomUUID()});return get().clientRequestId;},
 beginSubmission(payload){if(!get().pendingSubmission)set({pendingSubmission:JSON.parse(JSON.stringify(payload))});return get().pendingSubmission;},
 releaseSubmission(){set({pendingSubmission:null,clientRequestId:null});},
 clear(){set({items:[],clientRequestId:null,pendingSubmission:null,draft:blankDraft()});}
}),{name:'tukshop-food-cart-v1',storage:createJSONStorage(()=>typeof window==='undefined'?storage:window.localStorage)}));
export default useFoodCart;
