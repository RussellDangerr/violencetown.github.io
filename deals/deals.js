/**
 * Fast Food Deals — frontend
 *
 * Fetches deals.json, renders deal cards, and wires up search/filter controls.
 */

(function () {
  'use strict';

  let allDeals = [];

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const grid          = document.getElementById('deal-grid');
  const emptyState    = document.getElementById('empty-state');
  const searchInput   = document.getElementById('search-input');
  const restaurantSel = document.getElementById('restaurant-filter');
  const resultCount   = document.getElementById('result-count');
  const lastUpdatedEl = document.getElementById('last-updated');

  // ── Data loading ──────────────────────────────────────────────────────────

  async function loadDeals() {
    try {
      const res = await fetch('deals.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      allDeals = await res.json();
    } catch (err) {
      console.error('Failed to load deals.json:', err);
      allDeals = [];
    }

    populateRestaurantFilter();
    showLastUpdated();
    render();
  }

  // ── Filter & render ───────────────────────────────────────────────────────

  function getFilteredDeals() {
    const query      = searchInput.value.trim().toLowerCase();
    const restaurant = restaurantSel.value;

    return allDeals.filter((deal) => {
      if (restaurant && deal.restaurant !== restaurant) return false;
      if (query) {
        const haystack = `${deal.title} ${deal.description} ${deal.restaurant}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }

  function render() {
    const deals = getFilteredDeals();

    grid.innerHTML = '';

    if (deals.length === 0) {
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      deals.forEach((deal, i) => {
        const card = buildCard(deal, i);
        grid.appendChild(card);
      });
    }

    resultCount.textContent =
      deals.length === allDeals.length
        ? `${allDeals.length} deal${allDeals.length !== 1 ? 's' : ''}`
        : `${deals.length} of ${allDeals.length}`;
  }

  // ── Card builder ──────────────────────────────────────────────────────────

  function buildCard(deal, index) {
    const card = document.createElement('article');
    card.className = 'deal-card';
    card.style.animationDelay = `${index * 40}ms`;

    const expiresText = deal.expires
      ? `Expires ${formatDate(deal.expires)}`
      : 'No expiry listed';
    const expiresClass = deal.expires ? 'deal-expires' : 'deal-expires unknown';

    card.innerHTML = `
      <span class="deal-restaurant">${esc(deal.restaurant)}</span>
      <div class="deal-header">
        <h2 class="deal-title">${esc(deal.title)}</h2>
        <a class="deal-link" href="${esc(deal.url)}" target="_blank" rel="noopener noreferrer" title="View deal">↗</a>
      </div>
      ${deal.description ? `<p class="deal-description">${esc(deal.description)}</p>` : ''}
      <div class="deal-footer">
        <span class="${expiresClass}">${esc(expiresText)}</span>
      </div>
    `;

    return card;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(isoStr) {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  }

  function populateRestaurantFilter() {
    const restaurants = [...new Set(allDeals.map((d) => d.restaurant))].sort();
    restaurants.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      restaurantSel.appendChild(opt);
    });
  }

  function showLastUpdated() {
    if (allDeals.length === 0) return;
    // Most recent scrapedAt across all deals
    const latest = allDeals.reduce((best, d) =>
      d.scrapedAt > best ? d.scrapedAt : best, allDeals[0].scrapedAt);
    const formatted = new Date(latest).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
    lastUpdatedEl.hidden = false;
    lastUpdatedEl.querySelector('span').textContent = formatted;
  }

  // ── Event listeners ───────────────────────────────────────────────────────

  searchInput.addEventListener('input', render);
  restaurantSel.addEventListener('change', render);

  // ── Init ──────────────────────────────────────────────────────────────────

  loadDeals();
})();
