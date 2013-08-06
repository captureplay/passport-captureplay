# Passport-CapturePlay

[Passport](http://passportjs.org/) strategy for authenticating with [CapturePlay](http://www.captureplay.com/)
using the OAuth 2.0 API.

This module lets you authenticate using CapturePlay in your Node.js applications.
By plugging into Passport, CapturePlay authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-captureplay

## Usage

#### Configure Strategy

The CapturePlay authentication strategy authenticates users using a CapturePlay
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a app ID, app secret, and callback URL.

    passport.use(new CapturePlayStrategy({
        clientID: CAPTUREPLAY_APP_ID,
        clientSecret: CAPTUREPLAY_APP_SECRET,
        callbackURL: "http://localhost:3000/auth/captureplay/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ captureplayId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'captureplay'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/captureplay',
      passport.authenticate('captureplay'));

    app.get('/auth/captureplay/callback',
      passport.authenticate('captureplay', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

#### Extended Permissions

If you need extended permissions from the user, the permissions can be requested
via the `scope` option to `passport.authenticate()`.

For example, this authorization requests permission to the user's statuses and
checkins:

    app.get('/auth/captureplay',
      passport.authenticate('captureplay', { scope: ['user_status', 'user_checkins'] }));

#### Display Mode

The display mode with which to render the authorization dialog can be set by
specifying the `display` option.  Refer to CapturePlay's [OAuth Dialog](https://developers.captureplay.com/docs/reference/dialogs/oauth/)
documentation for more information.

    app.get('/auth/captureplay',
      passport.authenticate('captureplay', { display: 'touch' }));

#### Profile Fields

The CapturePlay profile is very rich, and may contain a lot of information.  The
strategy can be configured with a `profileFields` parameter which specifies a
list of fields (named by Portable Contacts convention) your application needs.
For example, to fetch only user's captureplay ID, name, and picture, configure
strategy like this.

    passport.use(new CapturePlayStrategy({
        // clientID, clientSecret and callbackURL
        profileFields: ['id', 'displayName', 'photos']
      },
      // verify callback
    ));

If `profileFields` is not specified, the default fields supplied by CapturePlay
will be parsed.

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-captureplay/tree/master/examples/login).

## Issues

CapturePlay's OAuth 2.0 implementation has a [bug][1] in which the fragment `#_=_`
is appended to the callback URL.  This appears to affect Firefox and Chrome, but
not Safari.  This fragment can be removed via client-side JavaScript, and [@niftylettuce](https://github.com/niftylettuce)
provides a suggested [workaround][2].  Developers are encouraged to direct their
complaints to CapturePlay in an effort to get them to implement a proper fix for
this issue.
[1]: https://developers.captureplay.com/bugs/196125357123225
[2]: https://github.com/jaredhanson/passport-captureplay/issues/12#issuecomment-5913711

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport-captureplay.png)](http://travis-ci.org/jaredhanson/passport-captureplay)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
