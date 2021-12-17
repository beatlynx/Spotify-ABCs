function displayTopArtists() {
  var request = new XMLHttpRequest()
  request.onload = function () {
    document.getElementById("test").innerText = request.responseText
  }
  request.open('POST', '/topartists', false)
  request.send()
}