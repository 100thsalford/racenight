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
  renderRaceTables(raceRows);
    updatePageTimestamp();

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
    <div class="tote-status-box ${statusClass}">
      🏇 <strong>${status.ToteStatus}</strong>
    </div>
    <p>📍 <strong>For Race:</strong> ${status.ForRace}</p>
    <p>🏁 <strong>Winner:</strong> ${status.Winner}</p>
  `;

  // 🔥 Render notice separately
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



function renderRaceTables(data) {
  const container = document.getElementById('race-tables');
  const grouped = {};

  data.forEach(row => {
    const race = row.RaceNumber;
    if (!grouped[race]) grouped[race] = [];
    grouped[race].push(row);
  });

  Object.keys(grouped).sort().forEach(raceNum => {
    const table = document.createElement('table');
    table.id = `race${raceNum}`;
    table.style.display = 'none';
    table.innerHTML = `
      <caption>Race ${raceNum}</caption>
      <thead><tr><th class="horse-number">Horse Number</th><th>Horse Name</th><th>Sponsor</th></tr></thead>
<tbody>
  ${grouped[raceNum].map(row => `
    <tr>
      <td class="horse-number">${row.HorseNumber}</td>
      <td>${row.HorseName}</td>
      <td>${row.SponsorName}</td>
    </tr>
  `).join('')}
</tbody>

    `;
    container.appendChild(table);
  });

  showRaceFromHash();
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

window.addEventListener('hashchange', showRaceFromHash);
function showRaceFromHash() {
  const allTables = document.querySelectorAll('table');
  const msg = document.getElementById('no-selection-message');
  const hash = window.location.hash;

  // Hide all race tables first…
  allTables.forEach(table => table.style.display = 'none');

  // Remove the active class from all race buttons
  const raceButtons = document.querySelectorAll('.race-button');
  raceButtons.forEach(btn => btn.classList.remove('active'));

  if (hash.startsWith('#race')) {
    // Show the appropriate table
    const tableToShow = document.querySelector(hash);
    if (tableToShow) {
      tableToShow.style.display = 'table';
      if (msg) msg.style.display = 'none';
    }
    // Add the active class to the corresponding race button
    const activeBtn = document.querySelector(`.race-button[href="${hash}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  } else {
    if (msg) msg.style.display = 'block';
  }
}

