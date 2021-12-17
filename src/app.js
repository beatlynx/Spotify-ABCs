//Imports
const express = require('express')
var session = require('express-session')
const SpotifyStrategy = require('passport-spotify').Strategy
const passport = require('passport')
var SpotifyWebApi = require('spotify-web-api-node')

//Express config
const env = require('dotenv').config()
const app = express()
const port = 3000 | process.env.PORT

//Create api object
var spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/auth/spotify/callback'
})

//Passport spotify
passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/spotify/callback'
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
      /*User.findOrCreate({ spotifyId: profile.id }, function(err, user) {
        return done(err, user);
      });*/
      session.spotifyAccessToken = accessToken
      session.spotifyRefreshToken = refreshToken
      console.log(profile.username)
      return done()
    }
  )
)

//Session middleware
app.use(session ({
  secret: process.env.SESSION_SECRET,
  secure: false,
  httpOnly: false,
  resave: false,
  saveUninitialized: true
}))

app.get('/', (req,res) => {
  res.sendFile(__dirname + '/static/index.html')
  try {
    console.log(session.spotifyAccessToken)
  }
  catch(err) {
    console.log("problemo")
  }
})

app.get('/static/scripts.js', (req, res) => {
  res.sendFile(__dirname + '/src/static/scripts.js')
})

app.get('/scripts.js', (req, res) => {
  res.sendFile(__dirname + '/static/scripts.js')
})

app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-private','user-library-read','user-top-read','user-read-recently-played','playlist-read-private'] }))

app.get('/auth/spotify/callback', passport.authenticate('spotify', { successRedirect: '/', failureRedirect: '/' }))

app.post('/topartists', (req, res) => {
  spotify.setAccessToken(session.spotifyAccessToken)
  spotify.getMyTopArtists()
  .then(function(data) {
    let topArtists = data.body.items;
    console.log(topArtists);
    res.send(topArtists)
  }, function(err) {
    res.send(err)
    console.log('Something went wrong!', err);
  });
})

app.use(function (req, res) {
  console.log(req.method, req.url)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
