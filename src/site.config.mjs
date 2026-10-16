// Rename the site here — single source of truth.
export const SITE = {
  name: 'India Outbound Travel News',
  tagline: 'Travel trade news for Indian travellers and the Indian travel trade',
  url: 'https://tangvah.github.io',
  base: '/travel-news-india',
  locale: 'en_IN',
};
export const DESTINATIONS = [
  { slug: 'thailand', name: 'Thailand' }, { slug: 'singapore', name: 'Singapore' },
  { slug: 'dubai', name: 'Dubai' }, { slug: 'vietnam', name: 'Vietnam' },
  { slug: 'bali', name: 'Bali' }, { slug: 'malaysia', name: 'Malaysia' },
  { slug: 'sri-lanka', name: 'Sri Lanka' },
  { slug: 'japan', name: 'Japan' },
];
export const CATEGORIES = [
  { slug: 'visas-policy', name: 'Visas & Policy' }, { slug: 'airlines-routes', name: 'Airlines & Routes' },
  { slug: 'hotels', name: 'Hotels' }, { slug: 'trade-industry', name: 'Trade & Industry' },
  { slug: 'deals', name: 'Deals' },
];

// Preview mode: SHOW_DRAFTS=1 includes draft: true articles (badged + noindex).
export const SHOW_DRAFTS = process.env.SHOW_DRAFTS === '1';
