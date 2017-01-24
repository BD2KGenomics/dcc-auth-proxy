// probably should have an http port that just redirects to https

const passport = require('passport')
// const session = require('express-session')
const express = require('express')
const fs = require('fs')
const https = require('https')

const app = express()
app.use(passport.initialize())
const GoogleStrategy = require('passport-google-oauth20').Strategy

const key = fs.readFileSync('ssl.key', 'utf8')
const cert = fs.readFileSync('ssl.crt', 'utf8')
const port = process.env.PORT

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.HOST}/auth/google/callback`
}, function (accessToken, refreshToken, profile, cb) {
  console.log('eh?', accessToken, refreshToken, profile)
  return cb(null, {name: profile.name})
}))

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')
})

app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}))

app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/login'}),
  function (req, res) {
    console.log('REQ', req)
    res.redirect('/')
  })

app.get('/secure', function (req, res) {
  res.send('')
})

const httpsServer = https.createServer({key, cert}, app)

console.log(`server listening on port ${port}`)
httpsServer.listen(port)
