/* ============================================
   OpenTickets - Consolidated JavaScript
   ============================================ */

/* ---------- Theme Toggle (persisted) ---------- */
function toggleTheme() {
  const htmlEl = document.documentElement;
  const current = htmlEl.getAttribute('data-bs-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';

  htmlEl.setAttribute('data-bs-theme', next);

  const icon = document.querySelector('#themeToggleBtn i');
  if (icon) {
    icon.className = next === 'dark' ? 'bi bi-moon-stars' : 'bi bi-sun-fill';
  }

  try { localStorage.setItem('ot-theme', next); } catch (e) {}
}

/* ---------- FAQ Page ---------- */
function liveFilterFaq(term) {
  const q = term.trim().toLowerCase();
  const items = document.querySelectorAll('.faq-query-item');
  let visibleCount = 0;

  items.forEach(item => {
    const text = item.innerText.toLowerCase();
    const keywords = (item.getAttribute('data-keywords') || '').toLowerCase();
    const collapseEl = item.querySelector('.accordion-collapse');

    if (!q || text.includes(q) || keywords.includes(q)) {
      item.classList.remove('d-none');
      visibleCount++;
      if (q.length > 2 && collapseEl) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });
        bsCollapse.show();
      }
    } else {
      item.classList.add('d-none');
    }
  });

  const noMatch = document.getElementById('noSearchMatch');
  if (noMatch) {
    if (visibleCount === 0) noMatch.classList.remove('d-none');
    else noMatch.classList.add('d-none');
  }
}

function clearFaqSearch() {
  const input = document.getElementById('faq-search');
  if (!input) return;
  input.value = '';
  liveFilterFaq('');
}

function setSearchPill(tag) {
  const input = document.getElementById('faq-search');
  if (!input) return;
  input.value = tag;
  liveFilterFaq(tag);
  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function switchCategory(catId, btn) {
  document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const heading = document.getElementById('currentCategoryHeading');
  if (heading) {
    const titles = {
      'tickets-purchasing': 'Tickets & Purchasing',
      'venues-entry': 'Venues & Stadium Entry',
      'payment-refunds': 'Payment & Refund Procedures',
      'account-security': 'Account & Security Policies'
    };
    heading.innerText = titles[catId] || heading.innerText;
  }

  clearFaqSearch();
}

/* ---------- Single Event Page ---------- */
var ticketCart = { ga: 2, vip: 1 };
var ticketPrices = { ga: 230, vip: 1300 };

function updateQty(tier, change) {
  ticketCart[tier] = Math.max(0, ticketCart[tier] + change);
  const qtyEl = document.getElementById('tier-qty-' + tier);
  if (qtyEl) qtyEl.innerText = ticketCart[tier];
  renderCartSummary();
}

function clearCart() {
  ticketCart.ga = 0;
  ticketCart.vip = 0;
  const gaEl = document.getElementById('tier-qty-ga');
  const vipEl = document.getElementById('tier-qty-vip');
  if (gaEl) gaEl.innerText = 0;
  if (vipEl) vipEl.innerText = 0;
  renderCartSummary();
}

function renderCartSummary() {
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  const badgeEl = document.getElementById('cart-badge-count');
  const totalCount = ticketCart.ga + ticketCart.vip;
  if (badgeEl) badgeEl.innerText = totalCount + (totalCount === 1 ? ' Pass' : ' Passes');

  let html = '';
  let totalAmount = 0;

  if (ticketCart.vip > 0) {
    const vipTotal = ticketCart.vip * ticketPrices.vip;
    totalAmount += vipTotal;
    html += `
      <div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-elevated">
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-info text-dark fw-bold">${ticketCart.vip}x</span>
          <div>
            <div class="fw-semibold text-white small">VIP Lounge Deck</div>
            <div class="text-secondary" style="font-size: 0.7rem;">Mezzanine express pass</div>
          </div>
        </div>
        <span class="fw-bold text-white small">R ${vipTotal.toLocaleString('en-ZA')}.00</span>
      </div>`;
  }

  if (ticketCart.ga > 0) {
    const gaTotal = ticketCart.ga * ticketPrices.ga;
    totalAmount += gaTotal;
    html += `
      <div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-elevated">
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-secondary text-white fw-bold">${ticketCart.ga}x</span>
          <div>
            <div class="fw-semibold text-white small">General Admission</div>
            <div class="text-secondary" style="font-size: 0.7rem;">R 230.00 each</div>
          </div>
        </div>
        <span class="fw-bold text-white small">R ${gaTotal.toLocaleString('en-ZA')}.00</span>
      </div>`;
  }

  if (totalCount === 0) {
    html = '<div class="p-3 rounded-3 bg-elevated text-center text-secondary small">No tickets selected. Use the + buttons above to select passes.</div>';
  }

  container.innerHTML = html;
  const formattedTotal = 'R ' + totalAmount.toLocaleString('en-ZA') + '.00';
  const sub = document.getElementById('cart-subtotal');
  const grand = document.getElementById('cart-grand-total');
  if (sub) sub.innerText = formattedTotal;
  if (grand) grand.innerText = formattedTotal;
}

function checkoutAction() {
  const totalCount = ticketCart.ga + ticketCart.vip;
  if (totalCount === 0) {
    alert('Please select at least 1 ticket to proceed.');
    return;
  }
  alert('Proceeding to South African Instant EFT / Card Secure Gateway.');
}

/* ---------- On Load ---------- */
document.addEventListener('DOMContentLoaded', function () {
  /* Sync theme icon with current theme */
  const htmlEl = document.documentElement;
  const themeIcon = document.querySelector('#themeToggleBtn i');
  if (themeIcon) {
    const current = htmlEl.getAttribute('data-bs-theme') || 'dark';
    themeIcon.className = current === 'dark' ? 'bi bi-moon-stars' : 'bi bi-sun-fill';
  }

  /* ---- Search Results Page ---- */
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return; // not on search-results page

  const clearBtn = document.getElementById('clearSearchBtn');
  const submitBtn = document.getElementById('submitSearchBtn');
  const activeQueryLabel = document.getElementById('activeQueryLabel');
  const resultsContentView = document.getElementById('resultsContentView');
  const emptyStateView = document.getElementById('emptyStateView');
  const emptyQueryTerm = document.getElementById('emptyQueryTerm');
  const toggleEmptyStateBtn = document.getElementById('toggleEmptyStateBtn');
  const resetToJhBtn = document.getElementById('resetToJhBtn');
  const eventsSection = document.getElementById('eventsSection');
  const faqSection = document.getElementById('faqSection');
  const tabEventsBtn = document.getElementById('tabEventsBtn');
  const tabFaqBtn = document.getElementById('tabFaqBtn');

  let showingEmpty = false;

  function showEmpty(query) {
    showingEmpty = true;
    if (resultsContentView) resultsContentView.classList.add('d-none');
    if (emptyStateView) emptyStateView.classList.remove('d-none');
    if (emptyQueryTerm) emptyQueryTerm.textContent = query;
    if (activeQueryLabel) activeQueryLabel.textContent = query;
    if (toggleEmptyStateBtn) toggleEmptyStateBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i><span>Restore Results</span>';
  }

  function showResults(query) {
    showingEmpty = false;
    if (resultsContentView) resultsContentView.classList.remove('d-none');
    if (emptyStateView) emptyStateView.classList.add('d-none');
    if (activeQueryLabel) activeQueryLabel.textContent = query;
    if (toggleEmptyStateBtn) toggleEmptyStateBtn.innerHTML = '<i class="bi bi-eye me-1"></i><span>Simulate Empty State</span>';
  }

  function updateSearch(term) {
    const query = term.trim();
    if (!query || query.toLowerCase() === 'xyz') {
      showEmpty(query || 'xyz');
    } else {
      showResults(query);
    }
  }

  if (clearBtn) clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); });
  if (submitBtn) submitBtn.addEventListener('click', () => updateSearch(searchInput.value));
  if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') updateSearch(searchInput.value); });
  if (toggleEmptyStateBtn) toggleEmptyStateBtn.addEventListener('click', () => {
    if (!showingEmpty) showEmpty('xyz');
    else { searchInput.value = 'Johannesburg'; showResults('Johannesburg'); }
  });
  if (resetToJhBtn) resetToJhBtn.addEventListener('click', () => {
    searchInput.value = 'Johannesburg'; showResults('Johannesburg');
  });

  window.switchTab = function (tab) {
    if (!tabEventsBtn || !tabFaqBtn || !eventsSection || !faqSection) return;
    if (tab === 'events') {
      eventsSection.classList.remove('d-none');
      faqSection.classList.remove('d-none');
      tabEventsBtn.classList.add('active');
      tabFaqBtn.classList.remove('active');
      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tab === 'faq') {
      tabFaqBtn.classList.add('active');
      tabEventsBtn.classList.remove('active');
      faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
});