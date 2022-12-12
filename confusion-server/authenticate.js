const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const config = require('./config');

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secretKey
};

passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
  User.findOne({_id: jwtPayload._id}, (err, user) => {
    if (err) {
      return done(err, false);
    } else if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
})),

module.exports = {
  getToken: user => {
    return jwt.sign(user, config.secretKey, {
      expiresIn: 3600
    });
  },
  verifyUser: passport.authenticate('jwt', {session: false}),
  verifyAdmin: (req, res, next) => {
    if (req.user.admin) {
      return next();
    } else {
      const err = new Error(`You are not authorized to perform this operation!`);
      err.status = 403;
      return next(err);
    }
  }
};
