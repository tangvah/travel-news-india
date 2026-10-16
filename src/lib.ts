import { getCollection } from 'astro:content';
import { SHOW_DRAFTS, CATEGORIES, DESTINATIONS } from './site.config.mjs';
export async function allNews() {
  return (await getCollection('news', (e) => SHOW_DRAFTS || !e.data.draft)).sort((a, b) => +b.data.date - +a.data.date);
}
export const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
export const readingTime = (body = '') => Math.max(1, Math.round(body.replace(/[#*_`>\[\]\(\)-]/g, ' ').split(/\s+/).filter(Boolean).length / 220));
export const cat = (slug: string) => CATEGORIES.find((c) => c.slug === slug)!;
export const dest = (slug: string) => DESTINATIONS.find((d) => d.slug === slug)!;
export const isVerified = (d: any) => d.verified === true && d.sources?.length > 0;

export const u = (p: string) => import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p.replace(/^\//, '');
