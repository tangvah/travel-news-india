import rss from '@astrojs/rss'; import { allNews } from '../lib'; import { SITE } from '../site.config.mjs';
export async function GET(context){ const items = (await allNews()).filter(e=>!e.data.draft);
 return rss({ title:SITE.name, description:SITE.tagline, site:new URL(import.meta.env.BASE_URL, context.site).href,
  items: items.map(e=>({ title:e.data.title, pubDate:e.data.date, description:e.data.summary, link:`${import.meta.env.BASE_URL.replace(/\/$/,'')}/news/${e.id}/` })) }); }
