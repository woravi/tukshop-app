import FoodTracking from '@/components/food/FoodTracking.jsx';
export const metadata={title:'ติดตามออร์เดอร์อาหาร | ครัวรัชนี',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function FoodOrderPage({params}){const {token}=await params;return <FoodTracking token={token}/>;}
