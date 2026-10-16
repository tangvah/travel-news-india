import { routes, show } from '../routes-data';
// Columns follow the Desk's routes_tracker.json, flattened, plus derived country/booking_open/article_url.
const COLS = [
  ['id', (r) => r.id], ['origin_city', (r) => r.origin.city], ['origin_iata', (r) => r.origin.iata],
  ['destination_city', (r) => r.destination.city], ['destination_iata', (r) => r.destination.iata], ['country', (r) => r.country],
  ['airline', (r) => r.airline], ['frequency', (r) => r.frequency], ['aircraft', (r) => r.aircraft],
  ['start_date', (r) => r.start_date], ['status', (r) => r.status], ['booking_open', (r) => r.booking],
  ['announcement_date', (r) => r.announcement_date], ['quote', (r) => r.quote],
  ['sources', (r) => r.sources.map((s) => `${s.name} <${s.url}>`).join(' | ')], ['verified', (r) => r.verified],
  ['last_checked', (r) => r.last_checked], ['notes', (r) => r.notes], ['article_url', (r, base) => (r.related_article ? new URL(`news/${r.related_article}/`, base).href : null)],
];
const cell = (v) => { const s = show(v); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export function GET({ site }) {
  const base = new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), site);
  const lines = [COLS.map(([h]) => h).join(','), ...routes.map((r) => COLS.map(([, g]) => cell(g(r, base))).join(','))];
  return new Response('\uFEFF' + lines.join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
