import { redirect } from "next/navigation";
import { signup } from "@/app/actions/auth";
import AuthForm from "@/app/components/AuthForm";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Sign up — 10KDAY" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="signup" action={signup} />;
}
