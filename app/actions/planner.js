"use server";

import Anthropic from "@anthropic-ai/sdk";
import { sql } from "@/lib/db";
import { planWalks } from "@/lib/planner";
import { getCurrentUser } from "@/lib/session";

const MAX_MESSAGE_LENGTH = 2000;

function isValidTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export async function sendScheduleMessage(prevState, formData) {
  const user = await getCurrentUser();
  if (!user) return { ...prevState, error: "Please log in again." };

  const text = String(formData.get("message") ?? "").trim();
  const timeZone = String(formData.get("timeZone") ?? "");
  if (!text) return { ...prevState, error: "Type something about your day first." };
  if (text.length > MAX_MESSAGE_LENGTH) {
    return { ...prevState, error: "That's a bit long. Try a shorter summary of your day." };
  }
  if (!isValidTimeZone(timeZone)) return { ...prevState, error: "Couldn't read your time zone." };

  // Work out the user's local date and time on the server so it can't drift.
  const now = new Date();
  const planDate = now.toLocaleDateString("en-CA", { timeZone }); // YYYY-MM-DD
  const localTime = now.toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });

  const rows = await sql`
    SELECT messages FROM walk_plans
    WHERE user_id = ${user.id} AND plan_date = ${planDate}
  `;
  const history = rows[0]?.messages ?? [];
  const messages = [
    ...history,
    { role: "user", content: `[Current local time: ${localTime}]\n${text}` },
  ];

  let result;
  try {
    result = await planWalks(messages);
  } catch (error) {
    console.error("Planner failed:", error);
    const message =
      error instanceof Anthropic.RateLimitError
        ? "The planner is busy right now. Try again in a minute."
        : "Something went wrong planning your walks. Please try again.";
    return { ...prevState, error: message };
  }

  const updated = [...messages, { role: "assistant", content: result.content }];
  await sql`
    INSERT INTO walk_plans (user_id, plan_date, time_zone, messages, walks)
    VALUES (${user.id}, ${planDate}, ${timeZone}, ${JSON.stringify(updated)}, ${JSON.stringify(result.plan.walks)})
    ON CONFLICT (user_id, plan_date) DO UPDATE
    SET messages = EXCLUDED.messages, walks = EXCLUDED.walks,
        time_zone = EXCLUDED.time_zone, updated_at = NOW()
  `;

  return {
    chat: [
      ...(prevState?.chat ?? []),
      { role: "user", text },
      { role: "assistant", text: result.plan.reply },
    ],
    walks: result.plan.walks,
    planDate,
    error: null,
  };
}
