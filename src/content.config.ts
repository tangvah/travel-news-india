import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const dest = z.enum(['thailand','singapore','dubai','vietnam','bali','malaysia','sri-lanka','japan']);
const news = defineCollection({
  // Travel News Desk drops Markdown drafts here (outside the project)
  loader: glob({ pattern: ['[^_]*.md', '!coverage_plan.md'] /* top-level only; _archive/, _TEMPLATE and planning notes ignored */, base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().max(300),
    author: z.string().default('Travel News Desk'),
    category: z.enum(['visas-policy','airlines-routes','hotels','trade-industry','deals']),
    destinations: z.array(dest).default([]),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    // Optional provenance. Badge "Verified: official source" shows only if verified: true AND sources has >=1 entry.
    sources: z.array(z.object({ name: z.string(), url: z.string().url() })).default([]),
    verified: z.boolean().default(false),
  }),
});
export const collections = { news };
