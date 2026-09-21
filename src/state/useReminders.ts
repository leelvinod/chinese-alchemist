/* Mandarin Mitra — the reminder loop.
   Registers the service worker, keeps a timer pointed at the next slot, and
   shows the reminder when it comes round. Everything it depends on can be
   missing — permission, a worker, a foreground tab — so it degrades to doing
   nothing rather than to an error. */

import { useEffect, useRef, useState } from 'react';
import { useStore } from './store';
import { PATTERNS } from '../content/patterns';
import {
  daysBetween,
  nextPrompt,
  nextReminderAt,
  promptPool,
  reminderTier,
} from '../engine/reminders';
import type { ReminderTier } from '../engine/reminders';
import { notifyPermission, registerWorker, showReminder } from '../engine/notify';

/** setTimeout saturates past ~24.8 days, so long waits are stepped. */
const MAX_DELAY = 6 * 60 * 60 * 1000;

export function useReminders(onQuickAnswer: (drillId: string | null) => void): void {
  const { state } = useStore();
  const lastSent = useRef<string | null>(null);
  const timer = useRef<number | null>(null);
  const [workerReady, setWorkerReady] = useState(false);

  const { reminders, customReminder, answerInNotification } = state.settings;
  const { activeDays } = state.progress;

  useEffect(() => {
    let cancelled = false;
    registerWorker().then(() => !cancelled && setWorkerReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // A tap on a reminder in an already-open tab arrives as a worker message.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'quick-answer') onQuickAnswer(e.data.drillId ?? null);
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [onQuickAnswer]);

  useEffect(() => {
    const clear = () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
    clear();

    if (!answerInNotification || reminders.length === 0) return;
    if (notifyPermission() !== 'granted') return;

    const tick = () => {
      const now = new Date();
      const last = activeDays[activeDays.length - 1];
      const silentDays = last ? daysBetween(new Date(last), now) : 0;
      const tier: ReminderTier = reminderTier(silentDays);

      const due = nextReminderAt(now, reminders, customReminder, tier);
      if (!due) return;

      const wait = due.getTime() - now.getTime();
      if (wait > MAX_DELAY) {
        // Re-check periodically rather than holding one very long timer, which
        // a backgrounded tab would not honour anyway.
        timer.current = window.setTimeout(tick, MAX_DELAY);
        return;
      }

      timer.current = window.setTimeout(() => {
        const pool = promptPool(PATTERNS, state.hsk);
        const prompt = nextPrompt(pool, lastSent.current);
        if (prompt) {
          lastSent.current = prompt.drillId;
          void showReminder(tier, prompt);
        }
        tick();
      }, Math.max(0, wait));
    };

    tick();
    return clear;
    // The loop is rebuilt whenever the schedule or the learner's silence changes.
  }, [answerInNotification, reminders, customReminder, activeDays, state.hsk, workerReady]);
}
