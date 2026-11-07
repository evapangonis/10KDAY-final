import { getStripe, syncSubscription } from "@/lib/stripe";

// Stripe calls this when a subscription starts, renews, changes, or is
// cancelled, so Pro access stays in sync even when the user isn't on the site.
export async function POST(request) {
  const stripe = getStripe();
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      request.headers.get("stripe-signature"),
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Stripe webhook signature check failed:", error.message);
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.subscription) {
        await syncSubscription(await stripe.subscriptions.retrieve(session.subscription));
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
  }

  return new Response("ok");
}
