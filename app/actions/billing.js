"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getStripe } from "@/lib/stripe";

async function siteUrl() {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function startCheckout() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.is_pro) redirect("/dashboard");

  const base = await siteUrl();
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    client_reference_id: String(user.id),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 399,
          recurring: { interval: "month" },
          product_data: { name: "10KDAY Pro" },
        },
      },
    ],
    subscription_data: { metadata: { user_id: String(user.id) } },
    success_url: `${base}/dashboard?checkout={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/dashboard`,
  });

  redirect(session.url);
}
