import rss from '@astrojs/rss'; import { weeks } from '../../newsletter'; import { SITE, NEWSLETTER } from '../../site.config.mjs';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export async function GET(context) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const abs = (p) => new URL(base + p, context.site).href;
  return rss({
    title: `${NEWSLETTER.name} | ${SITE.name}`, description: 'Weekly digest of India outbound travel news.',
    site: abs('/newsletter/'),
    items: (await weeks()).map((w) => ({
      title: `Weekly briefing: ${w.label}`, pubDate: w.items[0].data.date, link: `${base}/newsletter/${w.key}/`,
      description: `${w.range}: ${w.items.map((e) => e.data.title).join('; ')}`,
      content: `<p>${esc(w.range)}</p><ul>${w.items.map((e) => `<li><a href="${abs(`/news/${e.id}/`)}">${esc(e.data.title)}</a>: ${esc(e.data.summary)}</li>`).join('')}</ul>`,
    })),
  });
}
