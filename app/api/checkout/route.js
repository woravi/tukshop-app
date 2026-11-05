import { NextResponse } from "next/server";

// Reimplement only after currency, inventory reservation and payment flows are safe.
export async function POST() {
  return NextResponse.json({error: "Checkout unavailable"}, {status: 503});
}
