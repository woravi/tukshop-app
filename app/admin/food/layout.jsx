import {getServerSession} from 'next-auth/next';
import {redirect} from 'next/navigation';
import {authOptions} from '@/app/api/auth/[...nextauth]/route';
import {canManageFood} from '@/lib/food-permissions.mjs';
export const metadata={robots:{index:false,follow:false}};
export default async function FoodAdminLayout({children}){const session=await getServerSession(authOptions);if(!session?.user)redirect('/login?callbackUrl=%2Fadmin%2Ffood');if(!canManageFood(session))redirect('/food');return children;}
