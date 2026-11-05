import {create} from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'
import { availableStock } from '../lib/stock.mjs';

const useCartStore = create(
    persist((set,get)=> ({
        items: [],
        addItem: (item)=> { let added = false; set((state)=> {
            const existingItem = state.items.find((i)=> i._id === item._id);
            const stock = availableStock(item);
            if(existingItem){
                const quantity = existingItem.quantity || 1;
                added = quantity < stock;
                return {items: state.items.map((i)=> i._id === item._id ? {...i, stock: item.stock, quantity: added ? quantity + 1 : quantity} : i)};
            }
            if (stock < 1) return state;
            added = true;
            return {items: [...state.items, {...item, quantity: 1}]};

        }); return added; },
        removeItem: (itemId)=> 
            set((state)=> ({
                items: state.items.filter((item)=> item._id !== itemId),
                
            })),
            updateItemQuantity: (itemId, quantity)=> 
                set((state)=>({
                    items: state.items.map((item)=> {
                        if (item._id !== itemId || !Number.isInteger(quantity) || quantity < 1) return item;
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



