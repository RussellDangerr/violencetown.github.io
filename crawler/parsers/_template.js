/**
 * Parser Template — fast food deals crawler
 *
 * Every parser must export a single async function:
 *   parse(html, siteConfig) => Promise<Deal[]>
 *
 * A Deal object has this shape:
 * {
 *   id:          string,       // unique key: "<restaurant-id>-<hash or index>"
 *   restaurant:  string,       // display name, e.g. "McDonald's"
 *   title:       string,       // deal headline
 *   description: string,       // details / fine print (may be empty string)
 *   expires:     string|null,  // ISO 8601 date string, or null if unknown
 *   image:       string|null,  // absolute URL to deal image, or null
 *   url:         string,       // link back to the source deal page
 *   scrapedAt:   string,       // ISO 8601 timestamp of when this was crawled
 * }
 *
 * Usage:
 *   const cheerio = require('cheerio');
 *   const { makeId, nowISO } = require('../utils');
 *
 *   async function parse(html, site) {
 *     const $ = cheerio.load(html);
 *     const deals = [];
 *     // ... DOM traversal ...
 *     return deals;
 *   }
 *
 *   module.exports = { parse };
 */

const { nowISO } = require('../utils');

/**
 * Example no-op parser — returns an empty array.
 * Copy this file and implement parse() for a real restaurant.
 *
 * @param {string} html       Raw HTML from the deals page
 * @param {{ id: string, name: string, url: string }} site  Site config entry
 * @returns {Promise<object[]>}
 */
async function parse(html, site) {
  // TODO: implement parsing with cheerio
  // const cheerio = require('cheerio');
  // const $ = cheerio.load(html);
  return [];
}

module.exports = { parse };
