const raceCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRraMfoS7_nxJuYXMKjv82y1EVlaTn2W2UKyYUrm9IkBy_j_twOYdti8sx7L63b5U6ZcKbhapzFQvHh/pub?gid=0&single=true&output=csv';
const statusCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRraMfoS7_nxJuYXMKjv82y1EVlaTn2W2UKyYUrm9IkBy_j_twOYdti8sx7L63b5U6ZcKbhapzFQvHh/pub?gid=417106980&single=true&output=csv';

window.addEventListener('DOMContentLoaded', async () => {
  const [raceRes, statusRes] = await Promise.all([
    fetch(raceCsvUrl),
    fetch(statusCsvUrl)
  ]);

  const raceText = await raceRes.text();
  const statusText = await statusRes.text();

  const raceRows = parseCSV(raceText);
  const statusRows = parseCSV(statusText);

  renderStatus(statusRows[0]);
  renderRaceCards(raceRows);
  updatePageTimestamp();
  setupViewToggle(); // ✅ added here
});

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const entry = {};
    headers.forEach((h, i) => entry[h] = values[i]);
    return entry;
  });
}

function renderStatus(status) {
  const statusContainer = document.getElementById('status-section');
  const noticeContainer = document.getElementById('notice-section');

  if (!status) return;

  let statusClass = '';
  const statusText = status.ToteStatus.toLowerCase();

  if (statusText.includes('open')) {
    statusClass = 'status-open';
  } else if (statusText.includes('closed')) {
    statusClass = 'status-closed';
  } else if (statusText.includes('payout')) {
    statusClass = 'status-payout';
  }

  statusContainer.innerHTML = `
    <div class="tote-status-row">
      <div class="tote-status-box ${statusClass}">
        🏇 <strong>${status.ToteStatus}</strong>
      </div>
      <div id="countdown-timer" class="countdown-timer"></div>
    </div>
    <p>📍 <strong>For Race:</strong> ${status.ForRace}</p>
    <p>🏁 <strong>Winner:</strong> ${status.Winner}</p>
  `;

  if (status.CountdownTime) {
    startCountdown(status.CountdownTime);
  }

  noticeContainer.innerHTML = status.Notice ? generateNoticeHTML(status.Notice) : '';

  const toggleLink = document.getElementById('notice-toggle');
  const noticeText = document.getElementById('notice-text');
  if (toggleLink && noticeText) {
    toggleLink.addEventListener('click', (e) => {
      e.preventDefault();
      noticeText.classList.toggle('expanded');
      toggleLink.textContent = noticeText.classList.contains('expanded') ? 'Show less ▲' : 'Show more ▼';
    });
  }
}

function generateNoticeHTML(noticeText) {
  return `
    <div class="notice-banner">
      <p id="notice-text">${noticeText}</p>
      <a href="#" id="notice-toggle">Show more ▼</a>
    </div>
  `;
}

function startCountdown(targetTimeStr) {
  const countdownEl = document.getElementById('countdown-timer');
  if (!countdownEl) return;

  const target = new Date(targetTimeStr);
  if (isNaN(target.getTime())) {
    countdownEl.textContent = '⏳ Invalid countdown time';
    return;
  }

  function updateCountdown() {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      countdownEl.textContent = '⏳ Time remaining: 00:00:00';
      clearInterval(interval);
      return;
    }

    const hrs = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

    countdownEl.textContent = `⏳ Time remaining: ${hrs}:${mins}:${secs}`;
  }

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
}

function renderRaceCards(data) {
  const container = document.getElementById('race-tables');
  const grouped = {};

  data.forEach(row => {
    const race = row.RaceNumber;
    if (!grouped[race]) grouped[race] = [];
    grouped[race].push(row);
  });

  Object.keys(grouped).sort().forEach(raceNum => {
    const raceEntries = grouped[raceNum];
    const firstRow = raceEntries[0]; // use first entry to get name/sponsor

    const wrapper = document.createElement('div');
    wrapper.className = 'race-card-list';
    wrapper.id = `race${raceNum}`;

    const title = document.createElement('div');
    title.className = 'race-details';
    title.innerHTML = `
      <h2 class="race-name">🏁 ${firstRow.RaceName || `Race ${raceNum}`}</h2>
      <p class="race-sponsor">Sponsored by: ${firstRow.RaceSponsor || 'TBC'}</p>
    `;
    wrapper.appendChild(title);

    raceEntries.forEach(row => {
      const isWinner = row.IsWinner && ['true', 'yes', '1'].includes(row.IsWinner.toLowerCase());

      const card = document.createElement('div');
      card.className = 'horse-card';
      if (isWinner) card.classList.add('winner');

      const number = document.createElement('div');
      number.className = 'horse-number';
      number.innerHTML = isWinner
        ? `<div class="number-badge">${row.HorseNumber}</div>`
        : `<div class="number-badge">${row.HorseNumber}</div>`;

      const info = document.createElement('div');
      info.className = 'horse-info';

      const name = document.createElement('div');
      name.className = 'horse-name';
      name.textContent = isWinner ? `🎖️ ${row.HorseName}` : row.HorseName;

      const sponsor = document.createElement('div');
      sponsor.className = 'horse-sponsor';
      sponsor.textContent = `Sponsored by: ${row.SponsorName}`;

      info.appendChild(name);
      info.appendChild(sponsor);
      card.appendChild(number);
      card.appendChild(info);
      wrapper.appendChild(card);
    });

    container.appendChild(wrapper);
  });

  showRaceFromHash();
}

function showRaceFromHash() {
  const allRaceLists = document.querySelectorAll('.race-card-list');
  const msg = document.getElementById('no-selection-message');
  const hash = window.location.hash;

  allRaceLists.forEach(list => {
    list.style.display = 'none';
  });

  document.querySelectorAll('.race-button').forEach(btn => {
    btn.classList.remove('active');
  });

  if (hash.startsWith('#race')) {
    const raceToShow = document.querySelector(hash);
    if (raceToShow) {
      raceToShow.style.display = 'block';
      if (msg) msg.style.display = 'none';
    }

    const activeBtn = document.querySelector(`.race-button[href="${hash}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  } else {
    if (msg) msg.style.display = 'block';
  }
}

function updatePageTimestamp() {
  const el = document.getElementById('page-timestamp');
  if (!el) return;

  const now = new Date();
  const formatted = now.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  el.textContent = `Page loaded: ${formatted}`;
}

// ✅ View toggle setup — no extra listeners
function setupViewToggle() {
  const viewTabs = document.querySelectorAll('.view-tab');
  viewTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      viewTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selected = btn.dataset.view;
      document.body.classList.toggle('grid-view', selected === 'grid');
    });
  });
}

window.addEventListener('hashchange', showRaceFromHash);
