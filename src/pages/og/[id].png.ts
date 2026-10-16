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
  { name: 'Sora', data: f('sora/files/sora-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
  { name: 'Sans', data: f('inter-tight/files/inter-tight-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Sans', data: f('inter-tight/files/inter-tight-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
];
const h = (type: string, style: Record<string, any>, children?: any) => ({ type, props: { style, children } });
const logo = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#1b1b20"/><rect x="9" y="12" width="6" height="24" rx="1" fill="#ededf0"/><circle cx="30" cy="24" r="10" fill="none" stroke="#ededf0" stroke-width="6"/><circle cx="38.6" cy="15.4" r="3.6" fill="#9ea6ff" stroke="#1b1b20" stroke-width="1.6"/></svg>').toString('base64')}`;

export async function getStaticPaths() {
  return (await allNews()).map((e) => ({ params: { id: e.id }, props: { e } }));
}
export const GET: APIRoute = async ({ props }) => {
  const d = (props as any).e.data;
  const c = cat(d.category);
  const places = d.destinations.map((s: string) => dest(s).name).join(' · ');
  const title = d.title.length > 110 ? d.title.slice(0, 107) + '…' : d.title;
  const tree = h('div', { width: 1056, height: 490, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', backgroundColor: '#0d0d10', borderBottom: '12px solid #3b3fc4', color: '#f4f4f5', fontFamily: 'Sans', position: 'relative' }, [
    h('div', { display: 'flex', alignItems: 'center', gap: 18, fontSize: 26, fontWeight: 600, color: '#9ea6ff', letterSpacing: 2, textTransform: 'uppercase' }, [
      { type: 'img', props: { src: logo, width: 64, height: 64 } },
      h('span', {}, `${c.name}${places ? '  ·  ' + places : ''}`),
    ]),
    h('div', { display: 'flex', width: 1056, fontFamily: 'Sora', fontSize: title.length > 70 ? 60 : 72, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5 }, title),
    h('div', { display: 'flex', width: 1056, justifyContent: 'space-between', alignItems: 'center', fontSize: 28, color: '#a1a1aa' }, [
      h('span', { fontFamily: 'Sora', fontWeight: 700, color: '#f4f4f5', fontSize: 30, letterSpacing: -0.5 }, SITE.name),
      h('span', {}, fmt(d.date)),
    ]),
  ]);
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
