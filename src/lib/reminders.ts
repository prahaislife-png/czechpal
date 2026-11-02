import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import type { Href } from 'expo-router';
import { useEffect, useRef } from 'react';

import { daysUntil, longDate } from '@/lib/about';

/**
 * Local reminders: a deadline read from a letter, and the residence permit's expiry date.
 * Scheduled on this phone with expo-notifications; nothing goes through a server. On the web there
 * are no notifications, so a reminder is only listed in the app.
 */

export type Reminder = {
  id: string;
  kind: 'deadline' | 'permit';
  /** The case the deadline came from. */
  caseId?: string;
  /** The date it's about, YYYY-MM-DD. */
  date: string;
  /** What to do, in a few words: "Pay 1 840 Kč". */
  title: string;
  /** The scheduled notifications, to cancel them. */
  notificationIds: string[];
};

const supported = process.env.EXPO_OS !== 'web';
const CHANNEL = 'reminders';
const HOUR = 9;

/** Days before a letter's deadline, and before a permit expires. */
export const DEADLINE_DAYS = [3, 1];
export const PERMIT_DAYS = [120, 60, 30, 7];

if (supported) {
  // Shown even when the app is open: a reminder is the point.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Asks once. Android needs its channel before the prompt can appear. */
async function allowed() {
  if (!supported) return false;
  if (process.env.EXPO_OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Reminders',
      importance: AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === IosAuthorizationStatus.PROVISIONAL) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true } });
  return asked.granted;
}

/** 9:00 on the day `before` days ahead of YYYY-MM-DD, if that is still to come. */
function at(iso: string, before: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const when = new Date(y, m - 1, d - before, HOUR);
  return when.getTime() > Date.now() ? when : null;
}

function dueIn(days: number) {
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

/** What each notification says, and when. */
function plan(kind: Reminder['kind'], date: string, title: string) {
  if (kind === 'deadline') {
    return DEADLINE_DAYS.map((days) => ({ when: at(date, days), title: `${dueIn(days)}: ${title}`, body: `By ${longDate(date)}.` }));
  }
  return PERMIT_DAYS.map((days) => ({
    when: at(date, days),
    title: `Your residence permit expires on ${longDate(date)}`,
    body: days > 7 ? 'Check when you can apply to extend it.' : 'One week left. Check that your application is in.',
  }));
}

/**
 * Schedules a reminder's notifications. Returns the reminder, or `denied` when the person said no
 * to notifications (the reminder is still worth listing in the app).
 */
export async function scheduleReminder(input: Omit<Reminder, 'notificationIds'>): Promise<{ reminder: Reminder; denied: boolean }> {
  const notificationIds: string[] = [];
  const steps = plan(input.kind, input.date, input.title).filter((s) => s.when);
  if (steps.length && supported) {
    if (!(await allowed())) return { reminder: { ...input, notificationIds }, denied: true };
    for (const step of steps) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: step.title, body: step.body, data: { reminderId: input.id } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: step.when!, channelId: CHANNEL },
      });
      notificationIds.push(id);
    }
  }
  return { reminder: { ...input, notificationIds }, denied: false };
}

export async function cancelReminder(reminder: Pick<Reminder, 'notificationIds'>) {
  if (!supported) return;
  await Promise.all(reminder.notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
}

/** Where tapping a reminder (in the app or in a notification) takes you. */
export const reminderHref = (r: Pick<Reminder, 'kind' | 'caseId'>): Href =>
  r.kind === 'deadline' && r.caseId ? { pathname: '/case/[id]', params: { id: r.caseId } } : '/about';

/** Reminders still ahead, soonest first; a deadline stays listed on its own day. */
export const upcoming = (reminders: Reminder[]) =>
  reminders.filter((r) => daysUntil(r.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));

const useLastResponse: () => Notifications.NotificationResponse | null | undefined = supported
  ? Notifications.useLastNotificationResponse
  : () => undefined;

/**
 * Opens the right screen when someone taps a reminder notification, including the tap that
 * launched the app. Each tap is handled once, when `open` says it could act on it.
 */
export function useReminderTap(open: (reminderId: string) => boolean) {
  const last = useLastResponse();
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!last || last.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const key = last.notification.request.identifier;
    const id = last.notification.request.content.data?.reminderId;
    if (handled.current === key || typeof id !== 'string') return;
    if (open(id)) handled.current = key;
  }, [last, open]);
}
