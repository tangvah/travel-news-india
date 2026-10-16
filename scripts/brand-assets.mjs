// Regenerates favicon set + og-default.png for the IO Monogram brand. Run: node scripts/brand-assets.mjs
import fs from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
const full = (t='#0d0d10',fg='#ffffff',dot='#8b9cff') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="${t}"/><rect x="9" y="12" width="6" height="24" rx="1" fill="${fg}"/><circle cx="30" cy="24" r="10" fill="none" stroke="${fg}" stroke-width="6"/><circle cx="38.6" cy="15.4" r="3.6" fill="${dot}" stroke="${t}" stroke-width="1.6"/></svg>`;
// 16px-simplified: no satellite dot, chunkier strokes, pixel-aligned, full-bleed tile.
const small = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#0d0d10"/><rect x="2" y="3" width="3" height="10" fill="#fff"/><circle cx="10.5" cy="8" r="3.5" fill="none" stroke="#fff" stroke-width="2.6"/></svg>`;
const png = (svg, w) => new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng();
fs.writeFileSync('public/favicon.svg', small);
fs.writeFileSync('public/favicon-32.png', png(small, 32));
// Apple touch: opaque, no rounded corners (iOS masks it), with padding.
const apple = full().replace('rx="10"', 'rx="0"');
fs.writeFileSync('public/apple-touch-icon.png', png(apple, 180));
fs.writeFileSync('public/icon-512.png', png(full(), 512));
fs.writeFileSync('public/icon-192.png', png(full(), 192));
fs.writeFileSync('public/site.webmanifest', JSON.stringify({ name: 'India Outbound Travel News', short_name: 'IO Travel News', icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }], theme_color: '#0d0d10', background_color: '#fafafa', display: 'browser' }, null, 2));
const f = (p) => fs.readFileSync('node_modules/@fontsource/' + p);
const fonts = [{ name: 'Sora', data: f('sora/files/sora-latin-700-normal.woff'), weight: 700 }, { name: 'Sans', data: f('inter-tight/files/inter-tight-latin-600-normal.woff'), weight: 600 }];
const h = (type, style, children) => ({ type, props: { style, children } });
const logo = 'data:image/svg+xml;base64,' + Buffer.from(full('#1b1b20', '#ededf0', '#9ea6ff')).toString('base64');
const tree = h('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36, padding: '0 96px', backgroundColor: '#0d0d10', borderBottom: '12px solid #3b3fc4', color: '#f4f4f5', fontFamily: 'Sora' }, [
  { type: 'img', props: { src: logo, width: 120, height: 120 } },
  h('div', { display: 'flex', fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }, [h('span', {}, 'India Outbound '), h('span', { color: '#9ea6ff', margin: '0 18px' }, 'Travel'), h('span', {}, 'News')]),
  h('div', { display: 'flex', fontFamily: 'Sans', fontWeight: 600, fontSize: 26, letterSpacing: 4, color: '#a1a1aa' }, 'VISA · ROUTES · TRADE NEWS FOR INDIAN TRAVELLERS'),
]);
fs.writeFileSync('public/og-default.png', png(await satori(tree, { width: 1200, height: 630, fonts }), 1200));
console.log('ok');
