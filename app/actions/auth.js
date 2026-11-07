"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";

function readFields(formData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signup(prevState, formData) {
  const { name, email, password } = readFields(formData);

  if (!name) return { error: "Please enter your name.", name, email };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address.", name, email };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", name, email };
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return { error: "An account with that email already exists. Try logging in.", name, email };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const rows = await sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${name}, ${email}, ${passwordHash})
    RETURNING id
  `;

  await createSession(rows[0].id);
  redirect("/dashboard");
}

export async function login(prevState, formData) {
  const { email, password } = readFields(formData);

  const rows = await sql`
    SELECT id, password_hash FROM users WHERE email = ${email}
  `;
  const user = rows[0];
  const valid = user && (await bcrypt.compare(password, user.password_hash));
  if (!valid) return { error: "Wrong email or password.", email };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
