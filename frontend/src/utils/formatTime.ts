const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatClockTime(ms: number): string {
  const d = new Date(ms);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}

/** Chat-list-style relative day label: time today, "Yesterday", weekday within a week, else date. */
export function formatChatTimestamp(ms: number): string {
  const now = Date.now();
  const todayStart = startOfDay(now);
  const dayStart = startOfDay(ms);
  const diffDays = Math.round((todayStart - dayStart) / DAY_MS);

  if (diffDays === 0) return formatClockTime(ms);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return WEEKDAYS[new Date(ms).getDay()];

  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
}

/** "last seen today at 3:45 PM" / "last seen Yesterday" / "last seen 12/07/26" */
export function formatLastSeen(ms: number): string {
  const now = Date.now();
  const diffDays = Math.round((startOfDay(now) - startOfDay(ms)) / DAY_MS);
  if (diffDays === 0) return `last seen today at ${formatClockTime(ms)}`;
  if (diffDays === 1) return 'last seen yesterday';
  return `last seen ${formatChatTimestamp(ms)}`;
}

/** Section header label used for date stamps inside a chat and starred-message groups. */
export function formatDayHeading(ms: number): string {
  const now = Date.now();
  const diffDays = Math.round((startOfDay(now) - startOfDay(ms)) / DAY_MS);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  const d = new Date(ms);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
}
