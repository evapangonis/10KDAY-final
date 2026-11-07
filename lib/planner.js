import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the walking planner inside 10KDAY, an app that helps people reach 10,000 steps a day.

The user tells you about their schedule for today. Plan short walks into the open gaps so their walking adds up to roughly 10,000 steps, and set each reminder 5-10 minutes before the walk so they get nudged before they're too busy to go.

Guidelines:
- Only plan walks after the current local time given in the message.
- Assume about 100 steps per minute of walking.
- Prefer several 10-30 minute walks over one long one, and put them right before busy stretches.
- If the user mentions steps they've already taken today, plan only the remaining steps.
- If the schedule is too full to reach 10,000, plan as much as fits and say so kindly.
- If the user hasn't shared a schedule yet, or asks something unrelated, answer briefly and ask about their day. Return an empty walks list in that case.
- When the user changes their plans, return the full updated list of walks, not just the changes.
- Keep "reply" friendly and short (2-4 sentences), written to the user. Use 12-hour times like "1:15pm" in the reply.
- Use 24-hour "HH:MM" strings for "start" and "remind_at".`;

const PLAN_FORMAT = {
  type: "json_schema",
  schema: {
    type: "object",
    properties: {
      reply: { type: "string" },
      walks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            start: { type: "string" },
            minutes: { type: "integer" },
            steps: { type: "integer" },
            remind_at: { type: "string" },
            note: { type: "string" },
          },
          required: ["start", "minutes", "steps", "remind_at", "note"],
          additionalProperties: false,
        },
      },
    },
    required: ["reply", "walks"],
    additionalProperties: false,
  },
};

// Sends the day's conversation to Claude and returns { content, plan }.
// `content` is the full assistant message, stored so the next turn can
// replay it unchanged.
export async function planWalks(messages) {
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: PLAN_FORMAT },
    system: SYSTEM_PROMPT,
    messages,
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The planner couldn't help with that request.");
  }

  const text = response.content.find((block) => block.type === "text")?.text;
  if (!text) throw new Error("The planner didn't return a plan.");

  return { content: response.content, plan: JSON.parse(text) };
}
