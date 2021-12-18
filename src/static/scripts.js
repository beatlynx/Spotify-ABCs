// eslint-disable-next-line no-unused-vars
function displayTopArtists() {
  const request = new XMLHttpRequest();
  request.onload = function replaceText() {
    const table = document.createElement('table');
    const headers = table.insertRow(0);

    table.className = 'table';

    const name = headers.insertCell(0);
    const link = headers.insertCell(1);

    name.innerHTML = '<th scope="col">Artist</th>';
    link.innerHTML = '<th scope="col">Link</th>';

    let artistCount = 1;

    JSON.parse(request.response).forEach((artist) => {
      const artistRow = table.insertRow(artistCount);

      const artistName = artist.name;
      const artistLink = artist.external_urls.spotify;

      const nameCol = artistRow.insertCell(0);
      const linkCol = artistRow.insertCell(1);

      nameCol.innerHTML = `<th scope="col">${artistName}</th>`;
      linkCol.innerHTML = `<th scope="col"><a href="${artistLink}" target="#blank">Spotify Link</a></th>`;

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

function testPlaylist() {
  const request = new XMLHttpRequest();
  request.onload = function playlistSearch() {
    console.log(request.response);
  };
  request.open('POST', '/search', false);
  request.send();
}

// eslint-disable-next-line no-unused-vars
function updatePage() {
  getAuthStatus();
  if (localStorage.authenticated) {
    document.getElementById('login-button').innerHTML = JSON.parse(user).username;
  }
}
