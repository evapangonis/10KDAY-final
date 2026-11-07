import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { startCheckout } from "@/app/actions/billing";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getStripe, syncSubscription } from "@/lib/stripe";
import Planner from "./Planner";

export const metadata = { title: "Dashboard — 10KDAY" };

// Turns stored API messages back into simple chat bubbles.
function toChat(messages) {
  return messages.map((message) => {
    if (message.role === "user") {
      return { role: "user", text: message.content.replace(/^\[Current local time: [^\]]*\]\n/, "") };
    }
    const text = message.content.find((block) => block.type === "text")?.text ?? "{}";
    return { role: "assistant", text: JSON.parse(text).reply ?? "" };
  });
}

async function getTodaysPlan(userId) {
  const rows = await sql`
    SELECT to_char(plan_date, 'YYYY-MM-DD') AS plan_date, time_zone, messages, walks
    FROM walk_plans WHERE user_id = ${userId}
    ORDER BY plan_date DESC LIMIT 1
  `;
  const plan = rows[0];
  if (!plan) return null;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: plan.time_zone });
  return plan.plan_date === today ? plan : null;
}

// After Stripe checkout, confirm the payment right away instead of waiting
// for the webhook, so the user sees Pro as soon as they land back here.
async function confirmCheckout(sessionId, user) {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== String(user.id) || !session.subscription) return;
    await syncSubscription(await stripe.subscriptions.retrieve(session.subscription));
  } catch (error) {
    console.error("Couldn't confirm checkout:", error.message);
  }
}

export default async function DashboardPage({ searchParams }) {
  let user = await getCurrentUser();
  if (!user) redirect("/login");

  const { checkout } = await searchParams;
  if (typeof checkout === "string" && checkout.startsWith("cs_") && !user.is_pro) {
    await confirmCheckout(checkout, user);
    user = await getCurrentUser();
  }

  const plan = user.is_pro ? await getTodaysPlan(user.id) : null;

  return (
    <main className="auth wide">
      <div className="topbar">
        <Link href="/" className="brand">
          10KDAY
        </Link>
        <form action={logout}>
          <button className="link-button" type="submit">
            Log out
          </button>
        </form>
      </div>

      <h1>Hi, {user.name}!</h1>
      <p className="lead">
        You&apos;re logged in as {user.email} on the{" "}
        <strong>{user.is_pro ? "Pro" : "Free"}</strong> plan.
      </p>

      {user.is_pro ? (
        <Planner
          initialChat={plan ? toChat(plan.messages) : []}
          initialWalks={plan?.walks ?? []}
          initialPlanDate={plan?.plan_date ?? null}
        />
      ) : (
        <div className="plan pro">
          <h3>Unlock your AI walking planner</h3>
          <p className="note">
            Tell 10KDAY your schedule and it plans walks around your day, with
            reminders before you get busy.
          </p>
          <p className="price">
            $3.99<span>/month</span>
          </p>
          <form action={startCheckout}>
            <button className="button" type="submit">
              Upgrade to Pro
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
