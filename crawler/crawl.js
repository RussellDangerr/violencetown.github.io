#!/usr/bin/env node
/**
 * Fast Food Deals Crawler — entry point
 *
 * Usage:
 *   node crawler/crawl.js
 *
 * Reads sites from config.js, fetches each page, passes HTML to the matching
 * parser, and writes the merged results to deals/deals.json.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

// Node 18+ has native fetch; fall back to node-fetch for older versions.
let fetchFn;
try {
  fetchFn = globalThis.fetch;
  if (!fetchFn) throw new Error('no native fetch');
} catch {
  fetchFn = require('node-fetch');
}

/**
 * Fetch a URL with a timeout and optional retries.
 * @param {string} url
 * @param {number} timeout  milliseconds
 * @param {number} retries  remaining attempts
 * @returns {Promise<string>} raw HTML
 */
async function fetchHTML(url, timeout, retries) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetchFn(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; FastFoodDealsCrawler/1.0; +https://russelldangerr.com/deals/)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    clearTimeout(timer);
    if (retries > 0) {
      console.warn(`  ↩  Retrying ${url} (${retries} left)…`);
      return fetchHTML(url, timeout, retries - 1);
    }
    throw err;
  }
}

async function main() {
  console.log('🍔 Fast Food Deals Crawler\n');

  const allDeals = [];
  const errors = [];

  for (const site of config.sites) {
    process.stdout.write(`  Crawling ${site.name}… `);
    try {
      const html = await fetchHTML(site.url, config.fetchTimeout, config.maxRetries);
      const parser = require(path.resolve(__dirname, site.parser));
      const deals = await parser.parse(html, site);
      allDeals.push(...deals);
      console.log(`✓ ${deals.length} deal(s)`);
    } catch (err) {
      console.log(`✗ failed`);
      console.error(`    ${err.message}`);
      errors.push({ site: site.id, error: err.message });
    }
  }

  // Sort newest-scraped first
  allDeals.sort((a, b) => b.scrapedAt.localeCompare(a.scrapedAt));

  const outputPath = path.resolve(__dirname, config.outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allDeals, null, 2));

  console.log(`\n✓ Wrote ${allDeals.length} deal(s) to ${path.relative(process.cwd(), outputPath)}`);
  if (errors.length) {
    console.warn(`⚠ ${errors.length} site(s) failed: ${errors.map(e => e.site).join(', ')}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
