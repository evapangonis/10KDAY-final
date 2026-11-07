"use client";

import Link from "next/link";
import { useActionState } from "react";

export default function AuthForm({ mode, action }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isSignup = mode === "signup";

  return (
    <main className="auth">
      <Link href="/" className="brand">
        10KDAY
      </Link>
      <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>

      <form action={formAction} className="form">
        {isSignup && (
          <label>
            Name
            <input name="name" autoComplete="name" defaultValue={state?.name} required />
          </label>
        )}
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state?.email}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={isSignup ? 8 : undefined}
            required
          />
        </label>

        {state?.error && <p className="error">{state.error}</p>}

        <button className="button" type="submit" disabled={pending}>
          {pending ? "One moment…" : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="switch">
        {isSignup ? (
          <>
            Already have an account? <Link href="/login">Log in</Link>
          </>
        ) : (
          <>
            New to 10KDAY? <Link href="/signup">Create an account</Link>
          </>
        )}
      </p>
    </main>
  );
}
