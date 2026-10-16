export function GET({ site }){ return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(import.meta.env.BASE_URL.replace(/\/$/,'')+'/sitemap-index.xml', site)}\n`); }
