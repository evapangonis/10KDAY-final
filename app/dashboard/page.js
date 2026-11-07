import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
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

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const plan = await getTodaysPlan(user.id);

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

      <Planner
        initialChat={plan ? toChat(plan.messages) : []}
        initialWalks={plan?.walks ?? []}
        initialPlanDate={plan?.plan_date ?? null}
      />
    </main>
  );
}
