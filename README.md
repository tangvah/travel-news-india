# India Outbound Travel News — local prototype

Astro 5 static site (no client JS). Rename the site in `src/site.config.mjs` (`SITE.name`); set `SITE.url` before launch (used for canonical, OG, sitemap, RSS).

## Run
```
npm install
npm run build      # outputs dist/
npm run preview    # http://127.0.0.1:4321
```

## Where articles live
Markdown files in **`/workspace/travel_news/`** (configured in `src/content.config.ts`, glob loader). Files starting with `_` are ignored. URL = `/news/<filename>/`.

## Adding an article (Travel News Desk)
1. Copy `/workspace/travel_news/_TEMPLATE.md` to `/workspace/travel_news/my-headline-slug.md`.
2. Fill in the frontmatter (below) and write the body.
3. Run `npm run build` — the build fails with a clear error if the frontmatter is invalid.
4. (Once a repo exists) open a pull request for editor review.

## Frontmatter schema
| field | required | type / values |
|---|---|---|
| title | yes | string |
| date | yes | YYYY-MM-DD |
| summary | yes | string, ≤300 chars (meta description, cards, RSS) |
| author | no | string, default "Travel News Desk" |
| category | yes | visas-policy, airlines-routes, hotels, trade-industry, deals |
| destinations | no | list of: thailand, singapore, dubai, vietnam, bali, malaysia, sri-lanka, japan |
| tags | no | list of strings |
| image | no | path/URL, used for og:image and JSON-LD |
| draft | no | true hides the article |
| sources | no | list of `{name, url}` (url must be a full URL). Rendered as a Source box on the article and as JSON-LD `citation` |
| verified | no | `true` shows the green "Verified: official source" badge, **only if** `sources` has at least one entry. Set it only after every fact has been checked against those official sources. |

## Template
```md
---
title: "Headline here"
date: 2026-10-16
summary: "One or two sentences."
author: "Travel News Desk"
category: visas-policy
destinations: [thailand]
tags: [visa]
draft: false
verified: false
sources:
  - name: "Official source title (date)"
    url: "https://official.example.gov/page"
---
Body in Markdown.
```

## Draft preview
Articles with `draft: true` are hidden in the normal build (`npm run build`).
`npm run preview:drafts` (= `SHOW_DRAFTS=1 astro build && astro preview`) builds with drafts included and serves on :4321. Drafts show a red DRAFT badge, carry `<meta name="robots" content="noindex, nofollow">`, and are left out of RSS. Run a normal `npm run build` again before publishing anything.

## Pages
`/` latest · `/destinations/<slug>/` (visa/currency/best-time are PLACEHOLDERS) · `/category/<slug>/` · `/news/<id>/` · `/about/` · `/contact/` (placeholder, no form backend).

## SEO
Per-page title + meta description, canonical, Open Graph/Twitter tags, JSON-LD `NewsArticle` on articles, `/sitemap-index.xml`, `/rss.xml`, `/robots.txt`.

## Design system
Tokens (colour, type, spacing, radius) are CSS custom properties at the top of `src/styles/global.css`, with light and dark sets.
Category colours: `color` key in `CATEGORIES` (`src/site.config.mjs`). Destination hero gradients and flag codes: `DESTINATIONS`.
Dark mode follows `prefers-color-scheme`. The header toggle stores the choice in `localStorage` (`theme`), set before first paint so there is no flash.
Page navigation uses Astro View Transitions (`<ClientRouter />`). The mobile menu is a no-JS `<details>` element.

## Lighthouse
`./lh.sh <label>` (needs the preview running on :4321) writes JSON and HTML reports to `lighthouse/<label>/`.
