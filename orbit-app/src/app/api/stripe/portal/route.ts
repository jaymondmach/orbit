import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/getOrCreateCurrentUser";
import { getOrCreateStripeCustomer } from "@/lib/billing";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { dbUser } = await getOrCreateCurrentUser();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl)
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL" },
        { status: 500 }
      );

    const customerId = await getOrCreateStripeCustomer(dbUser.id);

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/app/settings/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Portal failed" }, { status: 500 });
  }
}
