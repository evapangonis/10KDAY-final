import "server-only";
import Stripe from "stripe";
import { sql } from "@/lib/db";

// Created on first use so builds don't fail when the key isn't set.
let stripe;
export function getStripe() {
  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

// Marks a user as Pro (or not) based on their Stripe subscription.
export async function syncSubscription(subscription) {
  const isPro = ["active", "trialing", "past_due"].includes(subscription.status);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  await sql`
    UPDATE users
    SET is_pro = ${isPro},
        stripe_customer_id = ${customerId},
        stripe_subscription_id = ${subscription.id}
    WHERE id = ${Number(subscription.metadata.user_id)}
  `;
}
