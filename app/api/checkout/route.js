import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connect from '@/utils/config/dbConnection';
import Order from '@/utils/models/Order';
import { Product } from '@/utils/models/Product';
import Stripe from 'stripe';

export async function POST(req) {
  if (process.env.CHECKOUT_ENABLED !== "true") return NextResponse.json({error:'Checkout unavailable'},{status:503});
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) return NextResponse.json({error:'Unauthorized'},{status:401});
  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_URL) return NextResponse.json({error:'Payments not configured'},{status:503});
  try {
    const {name,city,postalCode,streetAddress,country,cartItems} = await req.json();
    if (![name,city,postalCode,streetAddress,country].every(x=>typeof x==='string' && x.trim() && x.length<500)) return NextResponse.json({error:'Invalid address'},{status:400});
    if (!Array.isArray(cartItems) || !cartItems.length || cartItems.length>50 || cartItems.some(item=> !/^[1-9]\d*$/.test(String(item.id)) || !Number.isInteger(item.quantity) || item.quantity<1 || item.quantity>99)) return NextResponse.json({error:'Invalid cart'},{status:400});
    await connect();
    const products = await Product.find({_id:{$in:[...new Set(cartItems.map(item=>String(item.id)))]}});
    const lines = [], cartProducts=[];
    let total=0;
    for (const item of cartItems) {
      const product = products.find(p=>p._id===String(item.id));
      if (!product || !Number.isFinite(Number(product.price)) || Number(product.price)<=0) return NextResponse.json({error:'Invalid cart product'},{status:400});
      const cents=Math.round(Number(product.price)*100);
      lines.push({price_data:{currency:'usd',product_data:{name:product.name},unit_amount:cents},quantity:item.quantity});
      cartProducts.push({product:product._id,quantity:item.quantity,price:Number(product.price)});
      total+=cents*item.quantity;
    }
    const order=await Order.create({name,email: session.user.email,city,postalCode,streetAddress,country,paid:false,cartProducts,total:total/100,user: session.user._id});
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
    const payment=await stripe.checkout.sessions.create({payment_method_types:['card'],line_items:lines,mode:'payment',success_url:`${process.env.NEXT_PUBLIC_URL}/checkout/success?orderId=${order._id}`,cancel_url:`${process.env.NEXT_PUBLIC_URL}/checkout/canceled`,metadata:{orderId:String(order._id)}});
    return NextResponse.json({url:payment.url});
  } catch (error) {
    console.error('Checkout failed',error);
    return NextResponse.json({error:'Checkout failed'},{status:500});
  }
}
