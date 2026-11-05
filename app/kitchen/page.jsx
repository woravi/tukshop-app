import {getServerSession} from 'next-auth/next';
import {redirect} from 'next/navigation';
import {authOptions} from '@/app/api/auth/[...nextauth]/route';
import {canManageFood,canUseKitchen} from '@/lib/food-permissions.mjs';
import FoodKitchen from '@/components/food/FoodKitchen.jsx';
export const metadata={title:'ใบงานครัว | ครัวตุ๊ก',robots:{index:false,follow:false}};
export default async function KitchenPage(){const session=await getServerSession(authOptions);if(!session?.user)redirect('/login?callbackUrl=%2Fkitchen');if(!canUseKitchen(session))redirect('/food');return <FoodKitchen manager={canManageFood(session)}/>;}
