import { routes, established, show, freq } from '../routes-data';
// Columns follow the Desk's routes_tracker.json, flattened, plus derived country/booking_open/article_url.
// category: 'new' (routes_tracker.json) or 'established' (established_routes.json); new rows first. Established rows leave tracker-only fields empty.
const COLS = [
  ['id', (r) => r.id], ['category', (r) => r.category], ['origin_city', (r) => r.origin.city], ['origin_iata', (r) => r.origin.iata],
  ['destination_city', (r) => r.destination.city], ['destination_iata', (r) => r.destination.iata], ['country', (r) => r.country],
  ['airline', (r) => r.airline], ['frequency', (r) => (r.category === 'new' ? r.frequency : freq(r.frequency))], ['aircraft', (r) => r.aircraft],
  ['start_date', (r) => r.start_date], ['status', (r) => r.status], ['booking_open', (r) => r.booking],
  ['announcement_date', (r) => r.announcement_date], ['quote', (r) => r.quote],
  ['sources', (r) => r.sources.map((s) => `${s.name} <${s.url}>`).join(' | ')], ['verified', (r) => r.verified],
  ['last_checked', (r) => r.last_checked], ['notes', (r) => r.notes], ['article_url', (r, base) => (r.related_article ? new URL(`news/${r.related_article}/`, base).href : null)],
];
// Fields the established file doesn't carry (aircraft, dates, status, booking, quote, article) are left blank on those rows.
const TRACKER_ONLY = new Set(['aircraft', 'start_date', 'status', 'booking_open', 'announcement_date', 'quote', 'article_url']);
const cell = (v) => { const s = show(v); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export function GET({ site }) {
  const base = new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), site);
  const lines = [COLS.map(([h]) => h).join(','), ...[...routes.map((r) => ({ ...r, category: 'new' })), ...established].map((r) => COLS.map(([h, g]) => (r.category !== 'new' && TRACKER_ONLY.has(h) ? '' : cell(g(r, base)))).join(','))];
  return new Response('\uFEFF' + lines.join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
