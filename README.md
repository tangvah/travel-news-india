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

## Visa tracker (`/visa-tracker/`) and flight routes tracker (`/routes/`)
Both are maintained by the Travel News Desk. `/routes-tracker/` redirects to `/routes/`, and the visa tracker's routes section links there.

### `src/data/visa-tracker.json`
This is a byte-for-byte copy of the Desk file `travel_news/data/visa_tracker.json`. Replace the file to update it, and never hand-edit values in the repo. It is an array of records:

| key | type | notes |
|---|---|---|
| `id` | string | `thailand`, `singapore`, `uae`, `vietnam`, `indonesia`, `malaysia`, `sri-lanka`, `japan` (mapped to flag and destination page in `src/pages/visa-tracker.astro`) |
| `destination` | string | display name |
| `passport_type` | string | e.g. `ordinary` |
| `purpose` | string | e.g. `tourism` |
| `rule_type` | string | e.g. `visa_exempt`, `visa_required`, `e_visa`, `visa_on_arrival_or_e_voa`, `eta_free`, `visa_required_e_visa_available`, `conditional_pre_approved_entry_visa`. Unknown values are shown with `_` replaced by spaces |
| `max_stay` | string \| null | shown as is; null is shown as "Not stated" |
| `fee` | object \| null | `{ amount, currency, applies_to }`; **null is shown as "Not stated"** (no number is ever invented) |
| `effective_date` | `YYYY-MM-DD` \| null | |
| `key_conditions` | string[] | bullet list |
| `quote` | string | verbatim quote from the official source, shown in quotes |
| `sources` | string[] (URLs) | shown as links (hostname as text). **Required to display** |
| `verified` | boolean | **only `true` records are published**; `false` records (currently UAE) are left out |
| `notes` | string | shown under the quote |
| `last_checked` | `YYYY-MM-DD` | shown on every row. **Required to display** |

A record appears on the live page only if `verified === true`, `sources` is not empty and `last_checked` is set.

### `src/data/routes_tracker.json` (flight routes tracker, `/routes/`)
This is a byte-for-byte copy of the Desk file `travel_news/data/routes_tracker.json`. To update it, copy the Desk file over it (`cp ../travel_news/data/routes_tracker.json src/data/`). Never hand-edit values in the repo. It is an array of records:

| key | type | notes |
|---|---|---|
| `id` | string | unique, e.g. `indigo-gau-bkk` |
| `origin` | `{ city, iata }` | shown as "City (IATA)" |
| `destination` | `{ city, iata }` | the IATA code sets the country filter through `AIRPORT_COUNTRY` in `src/routes-data.ts`. **Add new airports there**; unknown ones show "Not stated" |
| `airline` | string | also an airline filter |
| `frequency` | string \| null | free text from the release |
| `aircraft` | string \| null | null, `""` or `"not stated"` all show "Not stated" |
| `start_date` | `YYYY-MM-DD` \| null | rows are sorted by this, soonest first |
| `status` | string | `announced`, `on sale`, `launched` or `suspended` (other values are title-cased). A status filter. `on sale` sets "Booking open: Yes"; anything else shows "Not stated" |
| `announcement_date` | `YYYY-MM-DD` \| null | |
| `quote` | string \| null | short line from the release (shown under the route) |
| `sources` | `{ name, url }[]` | official airline sources. **Required to display** |
| `verified` | boolean | **only `true` records are published** (page and CSV); unverified rows stay in the file but are hidden |
| `notes` | string \| null | Desk notes. Writing `Covered in article-02` links the row to the published article whose file name starts with `article-02-` |
| `last_checked` | `YYYY-MM-DD` | shown per row; the newest date is shown as "Last checked" |

The page has no-JS filters (destination country, airline, status), a table on wide screens, cards on mobile, and `/routes.csv`, which is generated at build time from the same verified rows.

## Sharing and social images
- Articles have share links for WhatsApp, X, Facebook, LinkedIn, Telegram and email, plus Copy link (with an aria-live "Copied" toast) and a native share button that appears only where the browser supports it. There are no third-party scripts. Brand icons come from `simple-icons` (CC0) and are inlined at build time.
- Layout: a sticky vertical rail on desktop (1100px and wider), a fixed bottom bar on smaller screens (safe-area aware, with the page padded so it never hides content), and a share card at the end of the article.
- `src/pages/og/[id].png.ts` builds a 1200×630 PNG for each article at build time, using satori and @resvg/resvg-js with local Fontsource fonts. It is used for `og:image` and `twitter:image` (`summary_large_image`) with absolute URLs that include the base. Other pages use `public/og-default.png`.
