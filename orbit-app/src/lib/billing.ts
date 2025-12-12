// src/lib/billing.ts
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Returns true if the Stripe customer exists for the current STRIPE_SECRET_KEY.
 */
async function stripeCustomerExists(customerId: string): Promise<boolean> {
  try {
    const c = await stripe.customers.retrieve(customerId);
    // Stripe can return a DeletedCustomer object; treat that as not existing

    if ((c as any)?.deleted) return false;
    return true;
  } catch (e: any) {
    // If the customer is missing in this Stripe account/mode, treat as stale
    if (e?.code === "resource_missing") return false;
    throw e; // other errors should bubble up
  }
}

/**
 * Ensures a Stripe customer exists for this user, and stores stripeCustomerId on the user.
 * If the stored stripeCustomerId is stale (wrong Stripe account/mode), it will be replaced.
 */
export async function getOrCreateStripeCustomer(
  userId: string
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });

  if (!user) throw new Error("User not found");

  // If we already have a customer id, make sure it exists in THIS Stripe environment
  if (user.stripeCustomerId) {
    const ok = await stripeCustomerExists(user.stripeCustomerId);
    if (ok) return user.stripeCustomerId;
  }

  // Create a new customer in the current Stripe environment
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
