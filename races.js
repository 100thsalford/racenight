const publicSpreadsheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRraMfoS7_nxJuYXMKjv82y1EVlaTn2W2UKyYUrm9IkBy_j_twOYdti8sx7L63b5U6ZcKbhapzFQvHh/pubhtml';

window.addEventListener('DOMContentLoaded', () => {
  Tabletop.init({
    key: publicSpreadsheetURL,
    callback: function(data) {
      console.log("Fetched data:", data);
      showInfo(data["Race Data"]); // << This must match your tab name exactly
    },
    simpleSheet: false
  });
});


function showInfo(data) {
    console.log("Fetched data:", data);  // ADD THIS LINE
  const container = document.getElementById('race-tables');
  const grouped = {};

  data.forEach(row => {
    const race = row.RaceNumber;
    if (!grouped[race]) grouped[race] = [];
    grouped[race].push(row);
  });

  Object.keys(grouped).sort().forEach(raceNum => {
    const table = document.createElement('table');
    table.innerHTML = `
      <caption id="race${raceNum}">Race ${raceNum}</caption>
      <thead><tr><th>Horse Name</th><th>Sponsor</th></tr></thead>
      <tbody>
        ${grouped[raceNum].map(row => `
          <tr><td>${row.HorseName}</td><td>${row.SponsorName}</td></tr>
        `).join('')}
      </tbody>
    `;
    container.appendChild(table);
  });
}
