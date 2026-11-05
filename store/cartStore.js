import {create} from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'
import { availableStock } from '../lib/stock.mjs';
export const cartLineId=item=>item.variant_id==null?String(item._id):`${item._id}:${item.variant_id}`;

const useCartStore = create(
    persist((set,get)=> ({
        items: [],
        addItem: (product, variantId)=> { let added = false; set((state)=> {
            let item=product;
            if(product.is_demo)return state;
            if(product.has_variants || product.variants?.length){
                const variant=product.variants?.find(v=>String(v.id)===String(variantId)&&v.active);
                if(!variant)return state;
                item={...product,variant_id:variant.id,color:variant.color,size:variant.size,sku:variant.sku,price:variant.price,stock:variant.stock};
            }
            item={...item,lineId:cartLineId(item)};
            const existingItem = state.items.find((i)=> cartLineId(i) === item.lineId);
            const stock = availableStock(item);
            if(existingItem){
                const quantity = existingItem.quantity || 1;
                added = quantity < stock;
                return {items: state.items.map((i)=> cartLineId(i) === item.lineId ? {...i,...item,quantity: added ? quantity + 1 : quantity} : i)};
            }
            if (stock < 1) return state;
            added = true;
            return {items: [...state.items, {...item, quantity: 1}]};
        }); return added; },
        refreshProducts: products=>set(state=>({items:state.items.flatMap(item=>{
            const product=products.find(p=>String(p._id)===String(item._id));
            if(!product||product.is_demo)return [];
            const variant=item.variant_id==null?null:product.variants?.find(v=>String(v.id)===String(item.variant_id)&&v.active);
            if((item.variant_id!=null&&!variant)||(item.variant_id==null&&(product.has_variants||product.variants?.length)))return [];
            const fresh={...item,...product,...(variant?{variant_id:variant.id,sku:variant.sku,color:variant.color,size:variant.size,stock:variant.stock,price:variant.price}:{})};
            const stock=availableStock(fresh);if(stock<1)return [];
            return [{...fresh,lineId:cartLineId(fresh),quantity:Math.min(item.quantity||1,stock)}];
        })})),
        removeItem: (itemId)=> 
            set((state)=> ({
                items: state.items.filter((item)=> cartLineId(item) !== String(itemId)),
                
            })),
            updateItemQuantity: (itemId, quantity)=> 
                set((state)=>({
                    items: state.items.map((item)=> {
                        if (cartLineId(item) !== String(itemId) || !Number.isInteger(quantity) || quantity < 1) return item;
                        const current = item.quantity || 1;
                        if (quantity <= current) return {...item, quantity};
                        return quantity <= availableStock(item) ? {...item, quantity} : item;
                    }),
                })),
                clearCart: ()=> set({items: []}),
                getTotalItems: ()=> get().items.reduce((total, item)=> total + (item.quantity || 1), 0),
                getTotalPrice: ()=> get().items.reduce((total,item)=> total + item.price * (item.quantity || 1), 0),
    }), {
        name: "cart-storage",
        storage: createJSONStorage(()=> {
            if(typeof window !== "undefined") {
                return window.localStorage;
            }
            return {
                getItem: ()=> null,
                setItem: ()=>{},
                removeItem: ()=> {},
            }
        })
    })
);

export default useCartStore;



