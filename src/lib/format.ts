const dayMs = 86_400_000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today, 10:24" · "Yesterday" · "Mon" (this week) · "21 Oct" */
export function formatRelative(iso: string, now = new Date()) {
  const d = new Date(iso);
  const diff = Math.round((startOfDay(now) - startOfDay(d)) / dayMs);
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (diff <= 0) return `Today, ${time}`;
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString('en-GB', { weekday: 'long' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function isThisWeek(iso: string, now = new Date()) {
  return startOfDay(now) - startOfDay(new Date(iso)) < 7 * dayMs;
}
