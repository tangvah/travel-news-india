import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/site.config.mjs';
import remarkStripSources from './remark-strip-sources.mjs';
export default defineConfig({ site: SITE.url, base: SITE.base, trailingSlash: 'always', output: 'static', markdown: { remarkPlugins: [remarkStripSources] }, integrations: [sitemap({ filter: (page) => !page.includes('/routes-tracker/') })] });
