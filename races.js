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
      <thead><tr><th>Horse Number</th><th>Horse Name</th><th>Sponsor</th></tr></thead>
      <tbody>
        ${grouped[raceNum].map(row => `
          <tr><td>${row.HorseNumber}</td><td>${row.HorseName}</td><td>${row.SponsorName}</td></tr>
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

  allTables.forEach(table => table.style.display = 'none');

  if (hash.startsWith('#race')) {
    const tableToShow = document.querySelector(hash);
    if (tableToShow) {
      tableToShow.style.display = 'table';
      if (msg) msg.style.display = 'none';
    }
  } else {
    if (msg) msg.style.display = 'block';
  }
}
