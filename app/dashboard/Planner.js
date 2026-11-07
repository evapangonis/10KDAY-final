"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendScheduleMessage } from "@/app/actions/planner";
import { formatTime } from "./formatTime";
import Reminders from "./Reminders";

export default function Planner({ initialChat, initialWalks, initialPlanDate }) {
  const [state, formAction, pending] = useActionState(sendScheduleMessage, {
    chat: initialChat,
    walks: initialWalks,
    planDate: initialPlanDate,
    error: null,
  });
  const [timeZone, setTimeZone] = useState("");
  const formRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    if (!state.error) formRef.current?.reset();
    chatEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [state]);

  const totalSteps = state.walks.reduce((sum, walk) => sum + walk.steps, 0);

  return (
    <section className="planner">
      <h2>Plan today&apos;s walks</h2>

      <div className="chat-log">
        {state.chat.length === 0 && (
          <p className="bubble bot">
            Tell me what your day looks like — classes, work, meetings, plans
            — and I&apos;ll fit in walks before you get busy.
          </p>
        )}
        {state.chat.map((message, i) => (
          <p key={i} className={`bubble ${message.role === "user" ? "user" : "bot"}`}>
            {message.text}
          </p>
        ))}
        {pending && <p className="bubble bot thinking">Planning your walks…</p>}
        <div ref={chatEndRef} />
      </div>

      <form ref={formRef} action={formAction} className="chat-form">
        <input type="hidden" name="timeZone" value={timeZone} />
        <textarea
          name="message"
          rows={2}
          maxLength={2000}
          placeholder="e.g. Class 9–12, work 1–5, dinner at 7"
          required
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form.requestSubmit();
            }
          }}
        />
        <button className="button" type="submit" disabled={pending || !timeZone}>
          Send
        </button>
      </form>
      {state.error && <p className="error">{state.error}</p>}

      {state.walks.length > 0 && (
        <div className="walks">
          <h3>Today&apos;s walks · about {totalSteps.toLocaleString()} steps</h3>
          <ul>
            {state.walks.map((walk, i) => (
              <li key={i}>
                <strong>{formatTime(walk.start)}</strong> · {walk.minutes} min ·
                ~{walk.steps.toLocaleString()} steps
                <span className="walk-note">
                  {walk.note} · Reminder at {formatTime(walk.remind_at)}
                </span>
              </li>
            ))}
          </ul>
          <Reminders walks={state.walks} planDate={state.planDate} />
        </div>
      )}
    </section>
  );
}
