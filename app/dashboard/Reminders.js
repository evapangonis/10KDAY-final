"use client";

import { useEffect, useState } from "react";
import { formatTime } from "./formatTime";

function todayLocal() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function msUntil(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  return target.getTime() - Date.now();
}

// Schedules today's walk reminders while the dashboard is open.
export default function Reminders({ walks, planDate }) {
  const [permission, setPermission] = useState("default");
  const [active, setActive] = useState(null);

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
    else setPermission("unsupported");
  }, []);

  useEffect(() => {
    if (planDate !== todayLocal()) return;

    const timers = walks
      .map((walk) => ({ walk, delay: msUntil(walk.remind_at) }))
      .filter(({ delay }) => delay > 0)
      .map(({ walk, delay }) =>
        setTimeout(() => {
          const message = `Time to walk! ${walk.minutes} minutes at ${formatTime(walk.start)} (~${walk.steps.toLocaleString()} steps).`;
          setActive(message);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("10KDAY", { body: message });
          }
        }, delay),
      );

    return () => timers.forEach(clearTimeout);
  }, [walks, planDate]);

  async function enableNotifications() {
    setPermission(await Notification.requestPermission());
  }

  return (
    <div className="reminders">
      {active && (
        <div className="reminder-banner" role="alert">
          <span>{active}</span>
          <button className="link-button" onClick={() => setActive(null)}>
            Dismiss
          </button>
        </div>
      )}
      {permission === "default" && (
        <button className="link-button" onClick={enableNotifications}>
          Turn on reminder notifications
        </button>
      )}
      {permission === "granted" && (
        <p className="note">Reminders are on. Keep this tab open to get them.</p>
      )}
      {permission === "denied" && (
        <p className="note">
          Notifications are blocked in your browser. Reminders will show on this
          page while it&apos;s open.
        </p>
      )}
    </div>
  );
}
