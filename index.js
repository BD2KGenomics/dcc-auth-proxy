// probably should have an http port that just redirects to https

const passport = require('passport')
const session = require('express-session')
const express = require('express')
const fs = require('fs')
const https = require('https')

const app = express()
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true}))
app.use(passport.initialize())
app.use(passport.session())
const GoogleStrategy = require('passport-google-oauth20').Strategy

const key = fs.readFileSync('cert/ssl.key', 'utf8')
const cert = fs.readFileSync('cert/ssl.crt', 'utf8')
const port = process.env.PORT

const accessControl = JSON.parse(fs.readFileSync('accessControl.json', 'utf-8'))

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
  // TODO handle a response with multiple emails
  // so far i've only seen a responses of the form:
  // [ { value: 'USER@gmail.com', type: 'account' } ]
  if (profile.emails.length > 1) {
    return cb(new Error('multiple emails returned'))
  }
  return cb(null, {name: profile.displayName, email: profile.emails[0].value})
}))

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  if (!req.user) {
    res.send(`<a href="/auth/google">Login with Google</a>`)
  } else {
    res.send(`You are currently logged in as ${req.user.name} <a href="/logout">Logout</a>`)
  }
})

app.get('/service/:service', function (req, res) {
  if (!req.user) {
    req.session.redirect = req.url
    return res.redirect(`/auth/google`)
  }
  const service = req.params.service
  const privileges = accessControl[req.user.email].filter((priv) => {
    return priv.startsWith(service)
  }).map((priv) => {
    return priv.split('.')[1]
  })
  // TODO determine port to proxy to and proxy traffic there
  res.send(`you have privileges ${privileges}`)
})

app.get('/auth/google', function (req, res, next) {
  passport.authenticate('google', {
    scope: ['profile', 'email']
    //  callbackURL: `${process.env.HOST}/auth/google/callback?redir=${req.params.redir}`
  })(req, res, next)
})

app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/login'}),
  function (req, res) {
    if (req.session.redirect) {
      res.redirect(req.session.redirect)
      req.session.redirect = null
    } else {
      res.redirect('/')
    }
  })

app.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

app.get('/secure', function (req, res) {
  res.send('')
})

const httpsServer = https.createServer({key, cert}, app)

console.log(`server listening on port ${port}`)
httpsServer.listen(port)
