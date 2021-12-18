/* eslint-disable no-console */
// Imports
const express = require('express');
const session = require('express-session');
const SpotifyStrategy = require('passport-spotify').Strategy;
const passport = require('passport');
const SpotifyWebApi = require('spotify-web-api-node');
// eslint-disable-next-line no-unused-vars
const env = require('dotenv').config();
const path = require('path');

// Express config
const app = express();
const port = 3000 || process.env.PORT;

// Create api object
const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/auth/spotify/callback',
});

// Passport spotify
passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/spotify/callback',
    },
    (accessToken, refreshToken, _expiresIn, profile, done) => {
      /* User.findOrCreate({ spotifyId: profile.id }, function(err, user) {
        return done(err, user);
      }); */
      session.spotifyAccessToken = accessToken;
      session.spotifyRefreshToken = refreshToken;
      session.spotifyAuthenticated = true;
      session.user = profile;
      console.log(profile.username);
      return done(null, profile);
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  secure: false,
  httpOnly: false,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.session());

app.use(express.json());

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '/static/index.html'));
});

app.get('/static/scripts.js', (_req, res) => {
  res.sendFile(path.join(__dirname, '/src/static/scripts.js'));
});

app.get('/favicon.ico', (_req, res) => {
  res.sendFile(path.join(__dirname, '/static/favicon.ico'));
});

app.get('/scripts.js', (_req, res) => {
  res.sendFile(path.join(__dirname, '/static/scripts.js'));
});

app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-private', 'user-library-read', 'user-top-read', 'user-read-recently-played', 'playlist-read-private'] }));

app.get('/auth/spotify/callback', passport.authenticate('spotify', { successRedirect: '/', failureRedirect: '/' }));

app.get('/auth/getuser', (req, res) => {
  console.log(session.user);
  res.send(JSON.parse(JSON.stringify(session.user)));
});

app.get('/auth/status', (req, res) => {
  if (session.spotifyAuthenticated) {
    const payload = JSON.stringify('{ auth: true }');
    res.send(JSON.parse(payload));
  } else {
    const payload = JSON.stringify('{ auth: true }');
    res.send(JSON.parse(payload));
  }
});

function rand(max) {
  return Math.floor(Math.random() * max);
}

// eslint-disable-next-line no-unused-vars
async function searchLetter(artist, letter) {
  try {
    spotify.setAccessToken(session.spotifyAccessToken);
    const data = await spotify.searchTracks(`artist:${artist} track:${letter}`, { limit: 50, offset: 10 });
    const dataList = Object.values(data.body.tracks.items);
    const finalList = [];
    dataList.forEach((track) => {
      // console.log(track.name);
      if (track.name.startsWith(letter) || track.name.startsWith(`${letter}`.toUpperCase())) {
        finalList.push(track.name);
      }
    });
    const song = finalList[rand(finalList.length)];
    // console.log(song);
    return song;
  } catch (err) {
    console.error(err);
  }
  return null;
}

// eslint-disable-next-line no-unused-vars
async function getTopArtist() {
  try {
    spotify.setAccessToken(session.spotifyAccessToken);
    const result = await spotify.getMyTopArtists();
    const topArtists = result.body.items;
    return Object.values(topArtists)[0].name;
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function getTopArtistId() {
  try {
    spotify.setAccessToken(session.spotifyAccessToken);
    const result = await spotify.getMyTopArtists();
    const topArtists = result.body.items;
    return Object.values(topArtists)[0].id;
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function getTopArtists() {
  try {
    spotify.setAccessToken(session.spotifyAccessToken);
    const result = await spotify.getMyTopArtists();
    const topArtists = result.body.items;
    return topArtists;
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function getAlbums(artistId) {
  try {
    spotify.setAccessToken(session.spotifyAccessToken);
    const result = await spotify.getArtistAlbums(artistId, { include_groups: 'album', limit: 50 });
    const albumList = Object.values(result.body.items);
    return albumList;
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function getTracks(albums, letter) {
  try {
    spotify.setAccessToken(session.spotifyAccessToken);
    const finalAlbumList = albums;
    console.log(finalAlbumList);
    let trackList = await Promise.all(finalAlbumList.map(async (album) => {
      const tracks = await spotify.getAlbumTracks(album.id);
      const finalTrackList = await Promise.all(Object.values(tracks.body.items).map((track) => {
        if (track.name[0] === letter || track.name[0] === letter.toUpperCase()) {
          return track.name;
        }
        return null;
      }));
      return finalTrackList;
    }));
    trackList = trackList.flat(1);
    trackList = trackList.filter((val) => (val != null));
    return trackList;
  } catch (err) {
    console.error(err);
  }
  return null;
}

app.post('/topartists', async (_req, res) => {
  const result = await getTopArtists();
  res.send(result);
});

app.post('/search', async (_req, res) => {
  try {
    const topArtistId = await getTopArtistId();
    const result = await getAlbums(topArtistId);
    const tracks = await getTracks(result, 'b');
    res.send(tracks);
  } catch (err) {
    res.send(err);
  }
});

// eslint-disable-next-line no-unused-vars
app.use((req, _res) => {
  console.log(req.method, req.url);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
