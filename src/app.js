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
      console.log(profile.username);
      return done();
    },
  ),
);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  secure: false,
  httpOnly: false,
  resave: false,
  saveUninitialized: true,
}));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '/static/index.html'));
  try {
    console.log(session.spotifyAccessToken);
  } catch (err) {
    console.log('problemo');
  }
});

app.get('/static/scripts.js', (_req, res) => {
  res.sendFile(path.join(__dirname, '/src/static/scripts.js'));
});

app.get('/scripts.js', (_req, res) => {
  res.sendFile(path.join(__dirname, '/static/scripts.js'));
});

app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-private', 'user-library-read', 'user-top-read', 'user-read-recently-played', 'playlist-read-private'] }));

app.get('/auth/spotify/callback', passport.authenticate('spotify', { successRedirect: '/', failureRedirect: '/' }));

app.post('/topartists', (_req, res) => {
  spotify.setAccessToken(session.spotifyAccessToken);
  spotify.getMyTopArtists()
    .then((data) => {
      const topArtists = data.body.items;
      console.log(topArtists);
      res.send(topArtists);
    }, (err) => {
      res.send(err);
      console.log('Something went wrong!', err);
    });
});

// eslint-disable-next-line no-unused-vars
app.use((req, _res) => {
  console.log(req.method, req.url);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
