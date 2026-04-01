/**
 * Shared utilities for the fast food deals crawler.
 */

const crypto = require('crypto');

/**
 * Returns the current time as an ISO 8601 string.
 * @returns {string}
 */
function nowISO() {
  return new Date().toISOString();
}

/**
 * Creates a stable ID for a deal from a restaurant slug and a source string
 * (e.g. a title or URL fragment).
 * @param {string} restaurantId
 * @param {string} source
 * @returns {string}
 */
function makeId(restaurantId, source) {
  const hash = crypto
    .createHash('sha1')
    .update(source)
    .digest('hex')
    .slice(0, 8);
  return `${restaurantId}-${hash}`;
}

module.exports = { nowISO, makeId };
