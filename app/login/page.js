import { redirect } from "next/navigation";
import { login } from "@/app/actions/auth";
import AuthForm from "@/app/components/AuthForm";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Log in — 10KDAY" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="login" action={login} />;
}
