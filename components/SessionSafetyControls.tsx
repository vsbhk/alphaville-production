"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

const IDLE_LIMIT_MS = 30 * 60 * 1000;
const ACTIVITY_KEY = "alphaville-session-last-activity";

function minutesRemaining(milliseconds: number) {
  return Math.max(0, Math.ceil(milliseconds / 60_000));
}

export function SessionSafetyControls() {
  const lastActivity = useRef(0);
  const lastStoredActivity = useRef(0);
  const signingOut = useRef(false);
  const [remaining, setRemaining] = useState(IDLE_LIMIT_MS);

  useEffect(() => {
    function writeActivity(timestamp: number) {
      lastActivity.current = timestamp;
      if (timestamp - lastStoredActivity.current < 10_000) return;
      try {
        window.localStorage.setItem(ACTIVITY_KEY, String(timestamp));
        lastStoredActivity.current = timestamp;
      } catch { /* The in-tab timer still works when private browsing blocks storage. */ }
    }

    function recordActivity() {
      const now = Date.now();
      try {
        const sharedTimestamp = Number(window.localStorage.getItem(ACTIVITY_KEY));
        if (Number.isFinite(sharedTimestamp) && sharedTimestamp > lastActivity.current) lastActivity.current = sharedTimestamp;
      } catch { /* Fall back to activity in this tab. */ }
      if (now - lastActivity.current >= IDLE_LIMIT_MS) {
        if (!signingOut.current) {
          signingOut.current = true;
          void signOut({ callbackUrl: "/" });
        }
        return;
      }
      writeActivity(now);
    }

    function receiveOtherTabActivity(event: StorageEvent) {
      if (event.key !== ACTIVITY_KEY || !event.newValue) return;
      const timestamp = Number(event.newValue);
      if (Number.isFinite(timestamp) && timestamp > lastActivity.current) {
        lastActivity.current = timestamp;
        setRemaining(Math.max(0, IDLE_LIMIT_MS - (Date.now() - timestamp)));
      }
    }

    lastActivity.current = Date.now();
    recordActivity();
    const activityEvents: (keyof WindowEventMap)[] = ["pointerdown", "pointermove", "keydown", "touchstart", "scroll"];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
    window.addEventListener("storage", receiveOtherTabActivity);

    const timer = window.setInterval(() => {
      try {
        const sharedTimestamp = Number(window.localStorage.getItem(ACTIVITY_KEY));
        if (Number.isFinite(sharedTimestamp) && sharedTimestamp > lastActivity.current) lastActivity.current = sharedTimestamp;
      } catch { /* Fall back to activity in this tab. */ }

      const nextRemaining = Math.max(0, IDLE_LIMIT_MS - (Date.now() - lastActivity.current));
      setRemaining(nextRemaining);
      if (nextRemaining === 0 && !signingOut.current) {
        signingOut.current = true;
        void signOut({ callbackUrl: "/" });
      }
    }, 10_000);

    return () => {
      window.clearInterval(timer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      window.removeEventListener("storage", receiveOtherTabActivity);
    };
  }, []);

  return (
    <div className="ml-auto flex min-h-12 items-center gap-3 pl-2">
      <span className="hidden text-xs text-white/70 sm:inline" aria-live="off">Signs out after 30 min idle · {minutesRemaining(remaining)} min left</span>
      <button
        type="button"
        onClick={() => { signingOut.current = true; void signOut({ callbackUrl: "/" }); }}
        className="inline-flex min-h-10 items-center rounded-sm border border-white/50 px-3 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Sign out
      </button>
    </div>
  );
}
