import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig)
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    console.error("Bad signature", e);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const userId = session?.metadata?.userId as string | undefined;
      const customerId = session?.customer as string | undefined;
      const subscriptionId = session?.subscription as string | undefined;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: customerId ?? undefined,
            stripeSubscriptionId: subscriptionId ?? undefined,
          },
        });
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as any;

      const customerId = sub.customer as string;
      const subscriptionId = sub.id as string;
      const status = sub.status as string;

      const currentPeriodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;

      const plan =
        status === "active" || status === "trialing" ? "pro" : "free";

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: status,
          currentPeriodEnd: currentPeriodEnd ?? undefined,
          plan,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook error", e);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
