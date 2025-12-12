// src/app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/getOrCreateCurrentUser";
import { getOrCreateStripeCustomer } from "@/lib/billing";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  try {
    // IMPORTANT: API routes should never use redirect-based auth
    const { dbUser } = await getOrCreateCurrentUser("throw");

    const priceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRICE_ID_PRO_MONTHLY" },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL" },
        { status: 500 }
      );
    }

    const customerId = await getOrCreateStripeCustomer(dbUser.id);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${appUrl}/app/settings/billing?success=1`,
      cancel_url: `${appUrl}/app/settings/billing?canceled=1`,
      metadata: { userId: dbUser.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    // Stack "throw" mode -> treat as unauthorized
    const msg = typeof e?.message === "string" ? e.message : "";

    if (
      msg.toLowerCase().includes("unauth") ||
      msg.toLowerCase().includes("auth")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Stripe checkout error:", e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
