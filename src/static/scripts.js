// eslint-disable-next-line no-unused-vars
function displayTopArtists() {
  const request = new XMLHttpRequest();
  request.onload = function replaceText() {
    document.getElementById('test').innerText = request.responseText;
  };
  request.open('POST', '/topartists', false);
  request.send();
}
