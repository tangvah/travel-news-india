// Read-only helpers for the "When to go" feature. Data files (best_seasons.json, climate_normals.json) are copied
// from the Travel News Desk unchanged; this module only selects and formats values. Nothing here edits a value.
import seasons from './data/best_seasons.json';
import climate from './data/climate_normals.json';
import { visaRows, visaRuleLabel, VISA_MAP } from './trackers';
import { routes } from './routes-data';

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MON = MONTHS.map((m) => m.slice(0, 3));
export const monthSlug = (i: number) => MONTHS[i].toLowerCase();
export type Rating = 'best' | 'okay' | 'avoid';
export const RATING_LABEL: Record<Rating, string> = { best: 'Best', okay: 'Okay', avoid: 'Avoid' };
export const RATING_ICON: Record<Rating, string> = { best: '✓', okay: '~', avoid: '✕' };

export const SEASONS = seasons as any;
export const COUNTRIES: any[] = SEASONS.countries;
export const SOURCES: Record<string, { title: string; url: string }> = SEASONS.sources;
export const CLIMATE_META = (climate as any).meta;
const CITIES: any[] = (climate as any).cities;

// Site destination slug <-> best_seasons country id (presentation mapping only).
export const DEST_TO_SEASON: Record<string, string> = { thailand: 'thailand', singapore: 'singapore', dubai: 'uae', vietnam: 'vietnam', bali: 'indonesia', malaysia: 'malaysia', 'sri-lanka': 'sri_lanka', japan: 'japan', 'south-korea': 'south_korea' };
export const seasonCountry = (id: string) => COUNTRIES.find((c) => c.id === id);
export const destForSeason = (id: string) => Object.keys(DEST_TO_SEASON).find((k) => DEST_TO_SEASON[k] === id) ?? null;
/** Visa tracker row for a season country (ids differ only by _ vs -). */
export const visaForSeason = (id: string) => { const vid = id.replace(/_/g, '-'); return VISA_MAP[vid] ? visaRows.find((r: any) => r.id === vid) ?? null : null; };
export const visaLabel = (r: any) => visaRuleLabel(r.rule_type);
/** Published visa guides by season country id. */
export const VISA_GUIDES: Record<string, { href: string; title: string }> = { south_korea: { href: '/news/guide-south-korea-visa-for-indians/', title: 'South Korea visa for Indians' } };
const ROUTE_COUNTRY: Record<string, string> = { uae: 'United Arab Emirates', indonesia: 'Indonesia', sri_lanka: 'Sri Lanka', south_korea: 'South Korea' };
export const routesTo = (c: any) => routes.filter((r: any) => r.country === (ROUTE_COUNTRY[c.id] ?? c.country));

/** Contiguous month runs (wrapping Dec -> Jan) where months[i] === rating, as "November to February". */
export function runs(months: string[], rating: Rating): string[] {
  const on = months.map((m) => m === rating);
  if (on.every(Boolean)) return ['all year'];
  if (!on.some(Boolean)) return [];
  const start = on.findIndex((v, i) => !v && on[(i + 1) % 12]) + 1; // first month after an "off" month
  const out: string[] = []; let i = 0;
  while (i < 12) {
    const a = (start + i) % 12;
    if (!on[a]) { i++; continue; }
    let len = 0; while (len < 12 && on[(a + len) % 12]) len++;
    const b = (a + len - 1) % 12;
    out.push(len === 1 ? MONTHS[a] : `${MONTHS[a]} to ${MONTHS[b]}`);
    i += len;
  }
  return out;
}
/** Region name without its parenthetical city list, for use inside sentences. */
export const shortRegion = (n: string) => n.replace(/\s*\(.*\)\s*/g, '').trim();
export const joinList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

/** Plain-language answer built only from the month ratings. */
export function answer(c: any, name = c.country) {
  const groups = new Map<string, string[]>();
  for (const r of c.regions) { const p = joinList(runs(r.months, 'best')) || 'no single best month'; groups.set(p, [...(groups.get(p) ?? []), shortRegion(r.name)]); }
  const multi = c.regions.length > 1;
  const best = [...groups].map(([p, names]) => (multi ? `${p} for ${joinList(names)}` : p)).join('; ');
  const avoid = c.regions.map((r: any) => { const a = joinList(runs(r.months, 'avoid')); return a ? (multi ? `${shortRegion(r.name)}: ${a}` : a) : null; }).filter(Boolean);
  return { best: `Best time to visit ${name} from India: ${best}.`, avoid: avoid.length ? `Avoid if you can: ${avoid.join('; ')}.` : 'No month is rated "avoid".' };
}

// India-side peak periods, placed on the month strip. Dates/text come from india_peak_periods.
const PEAKS: any[] = SEASONS.india_peak_periods;
const diwali = PEAKS.find((p) => /diwali/i.test(p.name));
const dm = diwali?.dates.match(/(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{4})/);
export const INDIA_PEAKS = [
  ...(dm ? [{ key: 'diwali', short: `Diwali ${dm[1]} ${dm[2]}`, label: `Diwali (${dm[1]} ${dm[2]} ${dm[3]})`, months: [MON.indexOf(dm[2])], data: diwali }] : []),
  { key: 'school', short: 'School hols', label: 'Indian school holidays (mid-May to June)', months: [4, 5], data: PEAKS.find((p) => /school/i.test(p.name)) },
  { key: 'xmas', short: 'Xmas–NY', label: 'Christmas–New Year', months: [11, 0], data: PEAKS.find((p) => /christmas/i.test(p.name)) },
];
export const peaksIn = (i: number) => INDIA_PEAKS.filter((p) => p.months.includes(i));

/** Monthly climate for one city: official station values where the JSON provides arrays, else ERA5. */
export function cityClimate(city: string) {
  const c = CITIES.find((x) => x.city === city);
  if (!c) return null;
  const off = c.official_reference ?? null;
  const offT = off && Array.isArray(off.avg_high_c) && Array.isArray(off.avg_low_c);
  const offR = off && Array.isArray(off.rain_mm);
  const showRain = c.show_rain_on_site !== false;
  const months = c.months.map((m: any, i: number) => ({
    high: offT ? off.avg_high_c[i] : m.avg_high_c, low: offT ? off.avg_low_c[i] : m.avg_low_c,
    rain: !showRain ? null : offR ? off.rain_mm[i] : m.rain_mm,
  }));
  return { city: c.city, months, showRain, quality: c.quality, official: off,
    tempSrc: offT ? off.source : 'Open-Meteo ERA5 reanalysis, 2016–2025 averages',
    rainSrc: !showRain ? null : offR ? off.source : 'Open-Meteo ERA5 reanalysis, 2016–2025 averages',
    offSummary: off && !offT ? off.summary : null };
}

/** Year of the next occurrence of month i (current month counts), in IST at build time. */
export function nextYear(i: number, now = new Date()) {
  const [y, m] = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-').map(Number);
  return i + 1 >= m ? y : y + 1;
}
/** Regions with a given rating in month i, grouped by country (keeps data order). */
export function regionsIn(i: number, rating: Rating) {
  return COUNTRIES.map((c) => ({ c, regions: c.regions.filter((r: any) => r.months[i] === rating) })).filter((x) => x.regions.length > 0);
}
/** Month i figures for a region's first city (official values where provided; rain null when hidden). */
export const regionClimate = (r: any, i: number) => { const ct = r.cities[0] && cityClimate(r.cities[0]); return ct ? { city: ct.city, ...ct.months[i], showRain: ct.showRain, tempSrc: ct.tempSrc } : null; };
