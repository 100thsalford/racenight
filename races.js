// races.js
document.addEventListener('DOMContentLoaded', () => {
  const raceData = [
    {
      id: 'race1',
      horses: [
        { number: 1, name: 'Lightning Bolt', sponsor: 'John Smith' },
        { number: 2, name: 'Speedy Hooves', sponsor: 'Jane Doe' },
        { number: 3, name: 'Thunderstorm', sponsor: 'Acme Ltd' },
        { number: 4, name: 'Rapid Rocket', sponsor: 'Barry Fast' },
        { number: 5, name: 'Wind Rider', sponsor: 'RaceFuel Co.' },
        { number: 6, name: 'Gallop King', sponsor: 'Stables & Sons' },
        { number: 7, name: 'Firefoot', sponsor: 'Equine Edge' },
        { number: 8, name: 'Silver Streak', sponsor: 'Rider Insurance' }
      ]
    },
    // Add race2 to race8 here in the same format...
  ];

  const container = document.getElementById('race-tables');
  raceData.forEach(race => {
    const raceDiv = document.createElement('div');
    raceDiv.className = 'race-card-list';
    raceDiv.id = race.id;

    race.horses.forEach(horse => {
      const card = document.createElement('div');
      card.className = 'horse-card';

      const number = document.createElement('div');
      number.className = 'horse-number';
      number.textContent = horse.number;

      const info = document.createElement('div');
      info.className = 'horse-info';

      const name = document.createElement('div');
      name.className = 'horse-name';
      name.textContent = horse.name;

      const sponsor = document.createElement('div');
      sponsor.className = 'horse-sponsor';
      sponsor.textContent = `Sponsored by: ${horse.sponsor}`;

      info.appendChild(name);
      info.appendChild(sponsor);
      card.appendChild(number);
      card.appendChild(info);
      raceDiv.appendChild(card);
    });

    container.appendChild(raceDiv);
  });

  // Only show the selected race
  showRaceFromHash();
});

window.addEventListener('hashchange', showRaceFromHash);

function showRaceFromHash() {
  const allRaceLists = document.querySelectorAll('.race-card-list');
  const hash = window.location.hash;

  allRaceLists.forEach(list => {
    list.style.display = 'none';
  });

  if (hash.startsWith('#race')) {
    const raceToShow = document.querySelector(hash);
    if (raceToShow) {
      raceToShow.style.display = 'block';
      document.getElementById('no-selection-message').style.display = 'none';
    }
  }
}
