// Note: satori uses content-box sizing, so root size = 1200x630 minus padding (72*2) and padding+border (64*2+12).
// Build-time Open Graph images (1200x630 PNG) per article. Local and free: satori (SVG layout) + resvg-js (PNG).
import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import { allNews, cat, dest, fmt } from '../../lib';
import { SITE } from '../../site.config.mjs';

const f = (p: string) => fs.readFileSync(path.join(process.cwd(), 'node_modules/@fontsource', p));
const fonts = [
  { name: 'Serif', data: f('source-serif-4/files/source-serif-4-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
  { name: 'Sans', data: f('inter/files/inter-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Sans', data: f('inter/files/inter-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
];
const h = (type: string, style: Record<string, any>, children?: any) => ({ type, props: { style, children } });
const logo = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ff9933"/><stop offset="1" stop-color="#14b8a6"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="#262c35"/><path d="M11 36 C 15 18, 30 10, 38 13" fill="none" stroke="url(#a)" stroke-width="4" stroke-linecap="round"/><circle cx="11" cy="36" r="4.5" fill="#ff9933"/><path d="M35 8.5 L41 13 L34.5 16.5 Z" fill="#14b8a6"/></svg>').toString('base64')}`;

export async function getStaticPaths() {
  return (await allNews()).map((e) => ({ params: { id: e.id }, props: { e } }));
}
export const GET: APIRoute = async ({ props }) => {
  const d = (props as any).e.data;
  const c = cat(d.category);
  const places = d.destinations.map((s: string) => dest(s).name).join(' · ');
  const title = d.title.length > 110 ? d.title.slice(0, 107) + '…' : d.title;
  const tree = h('div', { width: 1056, height: 490, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', backgroundColor: '#14171c', borderBottom: '12px solid #ff9933', color: '#f5f3ee', fontFamily: 'Sans', position: 'relative' }, [
    h('div', { display: 'flex', alignItems: 'center', gap: 18, fontSize: 26, fontWeight: 600, color: '#ffb27a', letterSpacing: 2, textTransform: 'uppercase' }, [
      { type: 'img', props: { src: logo, width: 64, height: 64 } },
      h('span', {}, `${c.name}${places ? '  ·  ' + places : ''}`),
    ]),
    h('div', { display: 'flex', width: 1056, fontFamily: 'Serif', fontSize: title.length > 70 ? 60 : 72, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }, title),
    h('div', { display: 'flex', width: 1056, justifyContent: 'space-between', alignItems: 'center', fontSize: 28, color: '#c9ccd2' }, [
      h('span', { fontFamily: 'Serif', fontWeight: 700, color: '#f5f3ee', fontSize: 32 }, SITE.name),
      h('span', {}, fmt(d.date)),
    ]),
  ]);
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
