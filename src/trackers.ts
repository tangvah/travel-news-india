// Shared, read-only helpers for the visa and routes trackers (data files are never modified here).
import visa from './data/visa-tracker.json';
import { routes } from './routes-data';

// id in visa-tracker.json -> flag code + destination page slug
export const VISA_MAP: Record<string, [string, string]> = { thailand: ['th', 'thailand'], singapore: ['sg', 'singapore'], uae: ['ae', 'dubai'], vietnam: ['vn', 'vietnam'], indonesia: ['id', 'bali'], malaysia: ['my', 'malaysia'], 'sri-lanka': ['lk', 'sri-lanka'], japan: ['jp', 'japan'] };
export const VISA_RULE: Record<string, string> = { visa_exempt: 'Visa exemption', visa_required: 'Visa required', e_visa: 'e-Visa', visa_on_arrival_or_e_voa: 'Visa on arrival / e-VoA', eta_free: 'ETA, free', visa_required_e_visa_available: 'Visa required (e-Visa available)', conditional_pre_approved_entry_visa: 'Conditional pre-approved entry visa' };
export const visaRuleLabel = (r: string) => VISA_RULE[r] ?? r.replace(/_/g, ' ');
export const visaGroup = (r: string) => (r.startsWith('visa_exempt') ? 'free' : r.startsWith('visa_required') ? 'visa' : 'online');

export const visaRows = (visa as any[]).filter((r) => r.verified === true && r.sources?.length && r.last_checked);
export { routes };

const maxDate = (xs: (string | null | undefined)[]) => xs.filter(Boolean).map(String).sort().at(-1) ?? null;
/** Most recent last_checked date across verified rows (YYYY-MM-DD). */
export const visaUpdated = maxDate(visaRows.map((r) => r.last_checked));
export const routesUpdated = maxDate(routes.map((r) => r.last_checked));
export const trackersUpdated = maxDate([visaUpdated, routesUpdated]);

const d = (s: string) => new Date(s + 'T00:00:00+05:30');
export const dayLong = (s: string | null) => (s ? d(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'Not stated');
export const monthYear = (s: string | null) => (s ? d(s).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '');

/** Newest verified routes by announcement date (falls back to last_checked). */
export const latestRoutes = (n = 4) => [...routes].sort((a, b) => String(b.announcement_date ?? b.last_checked ?? '').localeCompare(String(a.announcement_date ?? a.last_checked ?? ''))).slice(0, n);
