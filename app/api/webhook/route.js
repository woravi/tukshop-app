import connect from "@/utils/config/dbConnection";
import Order from "@/utils/models/Order";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (process.env.CHECKOUT_ENABLED !== "true") return NextResponse.json({error:'Checkout unavailable'},{status:503});
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) return NextResponse.json({error:'Payments not configured'},{status:503});
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({error:'Invalid signature'},{status:400});
  }

  await connect();

  // Handle the event
  console.log(`Processing event type ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("Checkout session completed:", session.id);
      await handleSuccessfulPayment(session);
      break;
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment intent succeeded:", paymentIntent.id);
      await handleSuccessfulPayment(paymentIntent);
      break;
    // ... other event handlers
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function handleSuccessfulPayment(paymentObject) {
  let orderId;

  if (paymentObject.object === "checkout.session") {
    orderId = paymentObject.metadata.orderId;
  } else if (paymentObject.object === "payment_intent") {
    orderId = paymentObject.metadata.orderId;
  }

  console.log("Handling successful payment for order:", orderId);

  if (!orderId) {
    console.error("No orderId found in payment object metadata");
    return;
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paid: true,
        status: "processing",
      },
      { new: true }
    );

    if (!updatedOrder) {
      console.error(`No order found with id ${orderId}`);
      return;
    }

    console.log(`Order ${orderId} updated: paid = true, status = processing`);
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
  }
}