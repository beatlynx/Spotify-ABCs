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

app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-private', 'user-library-read', 'user-top-read', 'user-read-recently-played', 'playlist-read-private', 'playlist-modify-private', 'playlist-modify-public'] }));

app.get('/auth/spotify/callback', passport.authenticate('spotify', { successRedirect: '/', failureRedirect: '/' }));

app.get('/auth/logout', (req, res) => {
  req.logout();
  session.spotifyAccessToken = '';
  session.spotifyRefreshToken = '';
  session.spotifyAuthenticated = false;
  session.user = '';
  res.redirect('/');
});

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

function ensureAuthenticated (req, res, next) {
  if (session.spotifyAuthenticated) {
    next();
  } else {
    res.redirect('/');
  }
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

async function trackSearch(artistName, letter) {
  try {
    spotify.setAccessToken(session.spotifyAccessToken);
    const result = await spotify.search(`artist:${artistName} AND track:${letter.toUpperCase()} OR track:${letter}`, ['track'], { limit: 50, market: 'US' });
    let trackNames = await Promise.all(Object.values(result.body.tracks.items).map(
      async (track) => {
        if (track.name.startsWith(letter) || track.name.startsWith(letter.toUpperCase())) {
          const trackObj = `{ "name": "${track.name}", "id": "${track.id}", "link": "${track.external_urls.spotify}" }`;
          return JSON.parse(JSON.stringify(trackObj));
        }
        return null;
      },
    ));
    trackNames = trackNames.filter((trackName) => trackName !== null);
    return trackNames[rand(trackNames.length)];
    // return trackNames;
  } catch (err) {
    console.error(err);
    return err;
  }
}

async function createABCsPlaylist(info, artistName) {
  try {
    spotify.setAccessToken(session.spotifyAccessToken);
    const result = await spotify.createPlaylist(`Spotify ABCs: ${artistName}`);
    const trackIds = await Promise.all(Object.values(JSON.parse(info)).map((track) => {
      console.log(track.id);
      return `spotify:track:${track.id}`;
    }));
    await spotify.addTracksToPlaylist(result.body.id, trackIds);
    return result.body.external_urls.spotify;
  } catch (err) {
    console.error(err);
    return err;
  }
}

app.post('/topartists', ensureAuthenticated, async (_req, res) => {
  const result = await getTopArtists();
  res.send(result);
});

app.post('/abcstop', ensureAuthenticated, async (_req, res) => {
  try {
    const topArtistName = await getTopArtist();
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    let result = await Promise.all(
      letters.map(async (letter) => trackSearch(topArtistName, letter)),
    );
    result = result.filter((track) => track !== undefined);
    let finalResult = '{\n';
    for (let i = 0; i < result.length; i += 1) {
      finalResult += `"${i}": ${result[i]}${(i !== result.length - 1) ? ',' : ''}\n`;
    }
    finalResult += '\n}';
    finalResult = JSON.parse(JSON.stringify(finalResult));
    const resultAbcsPlaylist = await createABCsPlaylist(finalResult, topArtistName);
    let finalObject = '{\n';
    finalObject += `"0": ${JSON.stringify(finalResult)},`;
    finalObject += `"1": "${resultAbcsPlaylist}" }`;
    console.log(finalObject);
    res.send(finalObject);
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
