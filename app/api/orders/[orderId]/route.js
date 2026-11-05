import {NextResponse} from 'next/server'
import dbConnect from '@/utils/config/dbConnection'
import Order from '@/utils/models/Order'
import {Product} from '@/utils/models/Product'
import { authorizeRoles } from '@/lib/server-access'
import { ownsOrder } from '@/lib/access.mjs'

export async function GET(request, {params}){
    const { status, actor } = await authorizeRoles(['owner', 'manager', 'kitchen', 'customer']);
    if (status !== 200) return NextResponse.json({ error: "Unauthorized" }, { status });
    const {orderId} = await params;

    await dbConnect();

    try {
        const order = await Order.findById(orderId).populate({
          path: "cartProducts.product",
          model: Product,
        });

        if(!order){
           return NextResponse.json(
             {
               error: "Failed to fetch order",
             },
             { status: 404 }
           );
        }

        if (!ownsOrder({ user: actor }, order)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.json(order)
        
    } catch (error) {
        console.log("Error fetching order:" , error);
        return NextResponse.json({
            error: "Internal server error at api/order/[orderId]"
        }, {status: 500})
        
    }
}


