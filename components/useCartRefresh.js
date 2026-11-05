"use client";
import {useEffect,useState} from 'react';
import useCartStore from '@/store/cartStore';
export default function useCartRefresh(active=true){
 const [error,setError]=useState('');
 useEffect(()=>{if(!active)return;let live=true;const refresh=()=>{fetch('/api/products',{cache:'no-store'}).then(async res=>{if(!res.ok)throw new Error();return res.json();}).then(rows=>{if(live){useCartStore.getState().refreshProducts(rows);setError('');}}).catch(()=>{if(live)setError('ตรวจสอบสต็อกล่าสุดไม่ได้ กรุณาลองใหม่');});};refresh();window.addEventListener('focus',refresh);return()=>{live=false;window.removeEventListener('focus',refresh);};},[active]);
 return error;
}
