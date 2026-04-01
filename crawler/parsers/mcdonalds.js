/**
 * McDonald's parser — stub with sample data.
 *
 * Replace the stub deals array with real cheerio-based scraping once the
 * pipeline is confirmed working end-to-end.
 *
 * To implement real scraping:
 *   1. npm install cheerio  (already in crawler/package.json)
 *   2. const cheerio = require('cheerio');
 *   3. const $ = cheerio.load(html);
 *   4. Find deal card elements and extract title/description/image/url/expires
 */

const { makeId, nowISO } = require('../utils');

async function parse(html, site) {
  const scrapedAt = nowISO();

  // --- Stub data ---
  // Replace this array with real parsing logic.
  const stubDeals = [
    {
      title: 'Buy One Get One Free McDouble',
      description:
        'Buy any McDouble at regular price, get a second one free. Valid at participating locations. Limit one per customer per visit.',
      expires: null,
      image: null,
    },
    {
      title: '$1 Any Size Soft Drink',
      description:
        'Any size fountain drink for just $1. Available through the McDonald\'s app at participating locations.',
      expires: null,
      image: null,
    },
    {
      title: 'Free Medium Fries with $1 Purchase',
      description:
        'Order any item for $1 or more and get a free medium fries. App order required.',
      expires: null,
      image: null,
    },
  ];

  return stubDeals.map((deal) => ({
    id: makeId(site.id, deal.title),
    restaurant: site.name,
    title: deal.title,
    description: deal.description,
    expires: deal.expires,
    image: deal.image,
    url: site.url,
    scrapedAt,
  }));
}

module.exports = { parse };
