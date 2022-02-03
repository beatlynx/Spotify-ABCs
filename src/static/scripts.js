// eslint-disable-next-line no-unused-vars
function displayTopArtists() {
  const request = new XMLHttpRequest();
  request.onload = function replaceText() {
    if (document.getElementById('results_table')) {
      document.getElementById('results_table').remove();
    }

    const table = document.createElement('table');
    table.setAttribute('id', 'results_table');
    const headers = table.insertRow(0);

    table.className = 'table';

    const name = headers.insertCell(0);
    const name2 = headers.insertCell(1);

    name.innerHTML = '<th scope="col">Artist</th>';
    name2.innerHTML = '';

    let artistCount = 1;

    JSON.parse(request.response).forEach((artist) => {
      const artistRow = table.insertRow(artistCount);

      const artistName = artist.name;
      const artistLink = artist.external_urls.spotify;

      const nameCol = artistRow.insertCell(0);
      const linkCol = artistRow.insertCell(1);

      nameCol.innerHTML = `<th scope="col">${artistName}</th>`;
      linkCol.innerHTML = `<th scope="col"><a href="${artistLink}" target="#blank">Link</a></th>`;

      artistCount += 1;
    });

    document.getElementById('main-col').appendChild(table);
  };
  request.open('POST', '/topartists', false);
  request.send();
}

let user;

function getUser() {
  const request = new XMLHttpRequest();
  request.onload = function setAuthStatus() {
    user = request.response;
    console.log(request.response);
  };
  request.open('GET', '/auth/getuser', false);
  request.send();
}

// eslint-disable-next-line no-unused-vars
function getAuthStatus() {
  const request = new XMLHttpRequest();
  request.onload = function setAuthStatus() {
    console.log(request.response);
    localStorage.authenticated = request.response.auth;
    getUser();
  };
  request.open('GET', '/auth/status', false);
  request.send();
}

// eslint-disable-next-line no-unused-vars
function testPlaylist() {
  const request = new XMLHttpRequest();
  request.onload = function playlistSearch() {
    if (document.getElementById('results_table')) {
      document.getElementById('results_table').remove();
    }

    const table = document.createElement('table');
    table.setAttribute('id', 'results_table');

    const playlistLink = table.insertRow(0);

    const plname = playlistLink.insertCell(0);
    const pllink = playlistLink.insertCell(1);

    plname.innerHTML = '<th scope="col">Playlist Link</th>';
    pllink.innerHTML = `<th scope="col"><a href="${(JSON.parse(request.response))[1]}">Link</a></th>`;

    const headers = table.insertRow(1);

    table.className = 'table';

    const name = headers.insertCell(0);
    const name2 = headers.insertCell(1);

    name.innerHTML = '<th scope="col">Song</th>';
    name2.innerHTML = '';

    let trackCount = 2;

    Object.values(JSON.parse((JSON.parse(request.response))[0])).forEach((track) => {
      const t = JSON.parse(JSON.stringify(track));
      const trackRow = table.insertRow(trackCount);

      const trackName = t.name;
      const trackLink = t.link;

      const nameCol = trackRow.insertCell(0);
      const linkCol = trackRow.insertCell(1);

      nameCol.innerHTML = `<th scope="col">${trackName}</th>`;
      linkCol.innerHTML = `<th scope="col"><a href="${trackLink}" target="#blank">Play Song</a></th>`;

      trackCount += 1;
    });

    document.getElementById('main-col').appendChild(table);
  };
  request.open('POST', '/abcstop', false);
  request.send();
}

// eslint-disable-next-line no-unused-vars
function abcsArtist() {
  const request = new XMLHttpRequest();
  request.onload = function playlistSearch() {
    if (document.getElementById('results_table')) {
      document.getElementById('results_table').remove();
    }

    const table = document.createElement('table');
    table.setAttribute('id', 'results_table');

    const playlistLink = table.insertRow(0);

    const plname = playlistLink.insertCell(0);
    const pllink = playlistLink.insertCell(1);

    plname.innerHTML = '<th scope="col">Playlist Link</th>';
    pllink.innerHTML = `<th scope="col"><a href="${(JSON.parse(request.response))[1]}" target="#blank">Link</a></th>`;

    const headers = table.insertRow(1);

    table.className = 'table';

    const name = headers.insertCell(0);
    const name2 = headers.insertCell(1);

    name.innerHTML = '<th scope="col">Song</th>';
    name2.innerHTML = '';

    let trackCount = 2;

    Object.values(JSON.parse((JSON.parse(request.response))[0])).forEach((track) => {
      const t = JSON.parse(JSON.stringify(track));
      const trackRow = table.insertRow(trackCount);

      const trackName = t.name;
      const trackLink = t.link;

      const nameCol = trackRow.insertCell(0);
      const linkCol = trackRow.insertCell(1);

      nameCol.innerHTML = `<th scope="col">${trackName}</th>`;
      linkCol.innerHTML = `<th scope="col"><a href="${trackLink}" target="#blank">Play Song</a></th>`;

      trackCount += 1;
    });

    document.getElementById('main-col').appendChild(table);
  };
  request.open('POST', '/abcs', false);
  request.setRequestHeader('Content-Type', 'application/json');
  const artistName = document.getElementById('artistInput').value;
  const packet = `{"artist":"${artistName}"}`;
  console.log(JSON.parse(JSON.stringify(packet)));
  request.send(JSON.parse(JSON.stringify(packet)));
}

// eslint-disable-next-line no-unused-vars
function updatePage() {
  getAuthStatus();
  if (localStorage.authenticated) {
    document.getElementById('login-button').innerHTML = JSON.parse(user).username;
  }
}
