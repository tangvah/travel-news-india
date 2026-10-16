import { getCollection } from 'astro:content';
import { SHOW_DRAFTS } from './site.config.mjs';
export async function allNews() {
  return (await getCollection('news', (e) => SHOW_DRAFTS || !e.data.draft)).sort((a, b) => +b.data.date - +a.data.date);
}
export const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const u = (p: string) => (import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p.replace(/^\//, ''));
