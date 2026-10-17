// Single source of truth for naming, taxonomy and colours.
export const SITE = {
  name: 'India Outbound Travel News',
  short: 'IOTN',
  tagline: 'Travel trade news for Indian travellers and the Indian travel trade',
  url: 'https://tangvah.github.io',
  base: '/travel-news-india',
  locale: 'en_IN',
};
// hero: CSS gradient (no photos, no licensing). flag: key for src/components/Flag.astro
export const DESTINATIONS = [
  { slug: 'thailand', name: 'Thailand', flag: 'th', hero: 'linear-gradient(135deg,#0f3b6e 0%,#1f6fb2 55%,#e8a33d 100%)' },
  { slug: 'singapore', name: 'Singapore', flag: 'sg', hero: 'linear-gradient(135deg,#5b0f1a 0%,#b3202e 55%,#f08a5d 100%)' },
  { slug: 'dubai', name: 'Dubai', flag: 'ae', hero: 'linear-gradient(135deg,#3b2a12 0%,#a8742f 55%,#f1c27d 100%)' },
  { slug: 'vietnam', name: 'Vietnam', flag: 'vn', hero: 'linear-gradient(135deg,#0d3b2e 0%,#2e7d4f 55%,#d9b44a 100%)' },
  { slug: 'bali', name: 'Bali', flag: 'id', hero: 'linear-gradient(135deg,#0b4d4a 0%,#1d8a7a 55%,#f3b562 100%)' },
  { slug: 'malaysia', name: 'Malaysia', flag: 'my', hero: 'linear-gradient(135deg,#0c2a5b 0%,#24508f 50%,#c8302f 100%)' },
  { slug: 'sri-lanka', name: 'Sri Lanka', flag: 'lk', hero: 'linear-gradient(135deg,#4a1210 0%,#8d2b1e 50%,#e2a33a 100%)' },
  { slug: 'japan', name: 'Japan', flag: 'jp', hero: 'linear-gradient(135deg,#2a1a3a 0%,#8a2d4f 55%,#f3a3b5 100%)' },
];
// colour = text/accent colour token name defined in Base.astro (AA on its tint in both themes)
export const CATEGORIES = [
  { slug: 'visas-policy', name: 'Visas & Policy', color: 'c-visa' },
  { slug: 'airlines-routes', name: 'Airlines & Routes', color: 'c-air' },
  { slug: 'hotels', name: 'Hotels', color: 'c-hotel' },
  { slug: 'trade-industry', name: 'Trade & Industry', color: 'c-trade' },
  { slug: 'deals', name: 'Deals', color: 'c-deal' },
];
export const TOOLS = [
  { href: '/visa-tracker/', name: 'Visa tracker' },
  { href: '/routes/', name: 'Flight routes' },
];
// Preview mode: SHOW_DRAFTS=1 includes draft: true articles (badged + noindex).
export const SHOW_DRAFTS = process.env.SHOW_DRAFTS === '1';

// GoatCounter site code (subdomain). Leave empty until you have an account; empty emits no script (safe to merge early).
export const GOATCOUNTER_CODE = '';

// Newsletter sign-up. No email provider is connected, so the form shows "Coming soon" and collects nothing.
// To go live later with a free provider, set `provider` and `action` (the form's POST URL from the provider's
// embed code), e.g. Buttondown: action 'https://buttondown.com/api/emails/embed-subscribe/<username>', emailField 'email'.
// MailerLite and Substack embeds can instead be pasted as `embedHtml` (rendered as-is in place of the form).
export const NEWSLETTER = {
  name: 'The India Outbound Briefing',
  provider: null,      // 'buttondown' | 'mailerlite' | 'substack' | null
  action: null,        // provider form POST URL
  emailField: 'email', // name of the email input the provider expects
  hidden: {},          // extra hidden fields the provider's embed includes, e.g. { embed: '1' }
  embedHtml: null,     // alternative: the provider's full embed snippet
};
