import connect from "@/utils/config/dbConnection";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/utils/models/User";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { orderUpdates, promotions } = body;
  if (typeof orderUpdates !== 'boolean' || typeof promotions !== 'boolean') return NextResponse.json({error:'Invalid preferences'},{status:400});

  try {
    await connect();
    const user = await User.findOneAndUpdate(
      {
        email: session.user.email,
      },
      { notificationPreferences: {orderUpdates,promotions} },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }
    return NextResponse.json({
      message: "preferences updated",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "internal server error at the update preferences route" },
      { status: 500 }
    );
  }
}
