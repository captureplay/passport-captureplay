/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The CapturePlay authentication strategy authenticates requests by delegating to
 * CapturePlay using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your CapturePlay application's App ID
 *   - `clientSecret`  your CapturePlay application's App Secret
 *   - `callbackURL`   URL to which CapturePlay will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new CapturePlayStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/captureplay/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://www.captureplay.com/dialog/oauth';
  options.tokenURL = options.tokenURL || 'https://graph.captureplay.com/oauth/access_token';
  options.scopeSeparator = options.scopeSeparator || ',';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'captureplay';
  this._profileURL = options.profileURL || 'https://graph.captureplay.com/me';
  this._profileFields = options.profileFields || null;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Return extra CapturePlay-specific parameters to be included in the authorization
 * request.
 *
 * Options:
 *  - `display`  Display mode to render dialog, { `page`, `popup`, `touch` }.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function (options) {
  var params = {},
      display = options.display;

  if (display) {
    params['display'] = display;
  }

  return params;
};

/**
 * Retrieve user profile from CapturePlay.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `captureplay`
 *   - `id`               the user's CapturePlay ID
 *   - `username`         the user's CapturePlay username
 *   - `displayName`      the user's full name
 *   - `name.familyName`  the user's last name
 *   - `name.givenName`   the user's first name
 *   - `name.middleName`  the user's middle name
 *   - `gender`           the user's gender: `male` or `female`
 *   - `profileUrl`       the URL of the profile for the user on CapturePlay
 *   - `emails`           the proxied or contact email address granted by the user
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  var url = this._profileURL;
  if (this._profileFields) {
    var fields = this._convertProfileFields(this._profileFields);
    url += (fields !== '' ? '?fields=' + fields : '');
  }

  this._oauth2.getProtectedResource(url, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    
    try {
      var json = JSON.parse(body);
      var profile = json;
      json.provider = 'captureplay';
      json.accessToken = accessToken;
      
      // var profile = { provider: 'captureplay' };
      // profile.id = json.id;
      // profile.username = json.name;
      // profile.displayName = json.name;
      // profile.name = json.name;

      // profile.gender = json.gender;
      // profile.profileUrl = json.link;
      // profile.emails = [{ value: json.email }];
      
      // if (json.picture) {
      //   if (typeof json.picture == 'object' && json.picture.data) {
      //     // October 2012 Breaking Changes
      //     profile.photos = [{ value: json.picture.data.url }];
      //   } else {
      //     profile.photos = [{ value: json.picture }];
      //   }
      // }

      // profile._raw = body;
      // profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

Strategy.prototype._convertProfileFields = function(profileFields) {
  var map = {
    'id':          'id',
    'username':    'name',
    'displayName': 'name',
    'name':       ['name'],
    'gender':      'gender',
    'profileUrl':  'link',
    'emails':      'email',
    'photos':      'picture'
  };
  
  var fields = [];
  
  profileFields.forEach(function(f) {
    if (typeof map[f] === 'undefined') return;

    if (Array.isArray(map[f])) {
      Array.prototype.push.apply(fields, map[f]);
    } else {
      fields.push(map[f]);
    }
  });

  return fields.join(',');
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
