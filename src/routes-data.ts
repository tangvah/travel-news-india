// Adapter for the Travel News Desk's routes file (src/data/routes_tracker.json).
// The JSON is copied from the Desk unchanged; this file only reads and presents it.
import data from './data/routes_tracker.json';
import { DESTINATIONS } from './site.config.mjs';

type Src = { name: string; url: string };
type Raw = {
  id: string; origin: { city: string; iata?: string | null }; destination: { city: string; iata?: string | null };
  airline: string; frequency?: string | null; aircraft?: string | null; start_date?: string | null; status: string;
  announcement_date?: string | null; quote?: string | null; sources: Src[]; verified: boolean; notes?: string | null; last_checked?: string | null;
};

export const NS = 'Not stated';
/** null, empty or the Desk's literal "not stated" all read "Not stated". */
export const show = (v: unknown) => (v === null || v === undefined || String(v).trim() === '' || /^not stated$/i.test(String(v).trim()) ? NS : String(v));
export const STATUS: Record<string, string> = { announced: 'Announced', 'on sale': 'On sale', launched: 'Launched', suspended: 'Suspended' };
export const statusLabel = (s: string) => STATUS[s] ?? s.replace(/\b\w/g, (c) => c.toUpperCase());
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Destination airport (IATA) -> country, for the country filter. Presentation lookup only.
// Add an entry when the Desk adds a route to a new airport; unknown airports show "Not stated".
const AIRPORT_COUNTRY: Record<string, string> = {
  BKK: 'Thailand', DMK: 'Thailand', HKT: 'Thailand', CNX: 'Thailand', KIX: 'Japan', NRT: 'Japan', HND: 'Japan', ICN: 'South Korea', GMP: 'South Korea',
  SIN: 'Singapore', DXB: 'United Arab Emirates', AUH: 'United Arab Emirates', HAN: 'Vietnam', SGN: 'Vietnam', DAD: 'Vietnam',
  DPS: 'Indonesia', CGK: 'Indonesia', KUL: 'Malaysia', CMB: 'Sri Lanka', DAR: 'Tanzania', YYZ: 'Canada', YVR: 'Canada',
  LHR: 'United Kingdom', CDG: 'France', FRA: 'Germany', JFK: 'United States', SFO: 'United States', SYD: 'Australia', MEL: 'Australia',
};
const FLAG_BY_COUNTRY: Record<string, string> = { 'United Arab Emirates': 'ae', Indonesia: 'id' };

const ARTICLES = import.meta.glob('./content/news/article-*.md');
const articleIds = Object.keys(ARTICLES).map((p) => p.split('/').pop()!.replace(/\.md$/, ''));
/** "Covered in article-02" in the Desk's notes -> link to that published article. */
const relatedArticle = (notes?: string | null) => {
  const m = notes?.match(/article-(\d+)/i);
  return m ? articleIds.find((id) => id.startsWith(`article-${m[1].padStart(2, '0')}-`)) ?? null : null;
};

export const routes = (data as Raw[])
  .filter((r) => r.verified === true && Array.isArray(r.sources) && r.sources.length > 0)
  .map((r) => {
    const country = (r.destination.iata && AIRPORT_COUNTRY[r.destination.iata.toUpperCase()]) || NS;
    return {
      ...r, country,
      flag: FLAG_BY_COUNTRY[country] ?? DESTINATIONS.find((d) => d.name === country)?.flag ?? null,
      booking: r.status === 'on sale' ? 'Yes' : NS,
      related_article: relatedArticle(r.notes),
    };
  })
  .sort((a, b) => String(a.start_date ?? '9999').localeCompare(String(b.start_date ?? '9999')));

export const day = (s?: string | null) => (s ? new Date(s + 'T00:00:00+05:30').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : NS);
export const place = (p: { city: string; iata?: string | null }) => (p.iata ? `${p.city} (${p.iata})` : p.city);
