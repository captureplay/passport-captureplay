var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , CapturePlayStrategy = require('passport-captureplay').Strategy;

var CAPTUREPLAY_APP_ID = "5201588ff6100b891e000007"
var CAPTUREPLAY_APP_SECRET = "ad3b521f62ec5d8dea8244b7ebb925b7643f9dd3";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete CapturePlay profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the CapturePlayStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and CapturePlay
//   profile), and invoke a callback with a user object.
passport.use(new CapturePlayStrategy({
    clientID: CAPTUREPLAY_APP_ID,
    clientSecret: CAPTUREPLAY_APP_SECRET,
    callbackURL: "http://localhost:3001/auth/captureplay/callback",
    authorizationURL: 'http://captureplay.local:5000/api/v1/oauth/dialog/authorize',
    tokenURL: 'http://captureplay.local:5000/api/v1/oauth/token',
    profileURL: 'http://captureplay.local:5000/api/v1/users/me'
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's CapturePlay profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the CapturePlay account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));




var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/captureplay
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in CapturePlay authentication will involve
//   redirecting the user to captureplay.com.  After authorization, CapturePlay will
//   redirect the user back to this application at /auth/captureplay/callback
app.get('/auth/captureplay',
  passport.authenticate('captureplay'),
  function(req, res){
    // The request will be redirected to CapturePlay for authentication, so this
    // function will not be called.
  });

// GET /auth/captureplay/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/captureplay/callback', 
  passport.authenticate('captureplay', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3001);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
