// Build-time weekly digests: published articles grouped by ISO week (India time).
import { allNews } from './lib';
const IST = 330 * 60000;
/** ISO week of a date in IST -> { key: 'YYYY-Www', monday: Date (00:00 IST) } */
export function isoWeek(d: Date) {
  const t = new Date(d.getTime() + IST); // shift so UTC getters read IST wall time
  const day = (t.getUTCDay() + 6) % 7; // Mon=0
  const monday = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() - day);
  const thu = new Date(monday + 3 * 864e5);
  const year = thu.getUTCFullYear();
  const week = 1 + Math.round((thu.getTime() - Date.UTC(year, 0, 4) + ((new Date(Date.UTC(year, 0, 4)).getUTCDay() + 6) % 7) * 864e5) / (7 * 864e5));
  return { key: `${year}-W${String(week).padStart(2, '0')}`, start: new Date(monday - IST) };
}
const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
export async function weeks() {
  const items = (await allNews()).filter((e) => !e.data.draft);
  const map = new Map<string, { key: string; start: Date; end: Date; items: typeof items }>();
  for (const e of items) {
    const w = isoWeek(e.data.date);
    if (!map.has(w.key)) map.set(w.key, { key: w.key, start: w.start, end: new Date(w.start.getTime() + 6 * 864e5), items: [] });
    map.get(w.key)!.items.push(e);
  }
  return [...map.values()].sort((a, b) => b.key.localeCompare(a.key))
    .map((w) => ({ ...w, label: `Week ${Number(w.key.slice(-2))}, ${w.key.slice(0, 4)}`, range: `${fmt(w.start)} – ${fmt(w.end)}` }));
}
