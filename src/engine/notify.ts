/* Mandarin Mitra — notification delivery.
   The spec's open question was whether an Android notification can host a
   hold-to-speak mic inline. It cannot here either: a web notification's actions
   are buttons, not a recorder. So this builds the fallback the spec names — a
   lightweight overlay that opens straight into SF-08 — and the notification
   carries the prompt and the tap that opens it.

   Everything here is best-effort. Permission can be denied, the page can be
   closed when a reminder is due, and a browser can lack the API entirely; none
   of that may break a session, so every call reports rather than throws. */

import { collapsedCopy, notificationTitle } from './reminders';
import type { ReminderPrompt, ReminderTier } from './reminders';

export type NotifyPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export function notifyPermission(): NotifyPermission {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as NotifyPermission;
}

export async function askNotifyPermission(): Promise<NotifyPermission> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission as NotifyPermission;
  try {
    return (await Notification.requestPermission()) as NotifyPermission;
  } catch {
    return 'denied';
  }
}

/** Register the service worker. Without one, reminders can still be shown while
 *  a tab is open, but a tap cannot be routed to the overlay. */
export async function registerWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
      { scope: import.meta.env.BASE_URL },
    );
  } catch {
    return null;
  }
}

/** Show one reminder. Returns false when it could not be shown, so the caller
 *  can fall back to the in-app banner rather than assuming it landed. */
export async function showReminder(tier: ReminderTier, prompt: ReminderPrompt): Promise<boolean> {
  if (notifyPermission() !== 'granted') return false;

  type WithActions = NotificationOptions & { actions?: { action: string; title: string }[] };
  const options: WithActions = {
    body: collapsedCopy(tier, prompt),
    icon: `${import.meta.env.BASE_URL}icon.svg`,
    badge: `${import.meta.env.BASE_URL}icon-maskable.svg`,
    tag: 'mm-reminder',
    data: { drillId: prompt.drillId, patternId: prompt.patternId },
    // Two actions, as the spec's expanded state has: answer, or not now. The
    // mic itself lives in the overlay, because a notification cannot host one.
    actions: [
      { action: 'answer', title: 'Answer' },
      { action: 'later', title: 'Not now' },
    ],
  };

  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(notificationTitle(tier), options as NotificationOptions);
      return true;
    }
    // No worker: a plain notification still shows, but its actions are dropped
    // and the tap cannot be routed, so the overlay is opened by the page.
    const { actions: _dropped, ...plain } = options;
    new Notification(notificationTitle(tier), plain);
    return true;
  } catch {
    return false;
  }
}

/** The quick-answer request carried in the URL, if there is one. */
export function quickAnswerRequest(search: string): { drillId: string | null } | null {
  const params = new URLSearchParams(search);
  if (params.get('quick') !== '1') return null;
  return { drillId: params.get('drill') };
}

/** Clear the quick-answer parameters once the overlay has taken them, so a
 *  reload does not reopen it. */
export function clearQuickAnswerUrl(): void {
  if (typeof history === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('quick');
  url.searchParams.delete('drill');
  history.replaceState(null, '', url.toString());
}
