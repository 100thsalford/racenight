const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRraMfoS7_nxJuYXMKjv82y1EVlaTn2W2UKyYUrm9IkBy_j_twOYdti8sx7L63b5U6ZcKbhapzFQvHh/pub?gid=0&single=true&output=csv';

window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch(csvUrl);
  const text = await res.text();
  const rows = parseCSV(text);
  renderRaceTables(rows);
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

function renderRaceTables(data) {const table = document.createElement('table');
table.id = `race${raceNum}`;
table.innerHTML = `
  <caption>Race ${raceNum}</caption>
  <thead><tr><th>Horse Name</th><th>Sponsor</th></tr></thead>
  <tbody>
    ${grouped[raceNum].map(row => `
      <tr><td>${row.HorseName}</td><td>${row.SponsorName}</td></tr>
    `).join('')}
  </tbody>
`;

}
