import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Dashboard — 10KDAY" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="auth">
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

      <div className="plan">
        <h3>Your AI walking planner</h3>
        <p className="note">
          Coming soon: tell 10KDAY your schedule and it will plan walks around
          your day.
        </p>
      </div>
    </main>
  );
}
