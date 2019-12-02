const login = require("./passport");
const signUp = require("./signup");
const crossLogin = require("./crossLogin");
const bearer = require("./bearer");

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user);
  }),
    passport.deserializeUser((user, done) => {
      return done(null, user);
    });
  login(passport);
  signUp(passport);
  crossLogin(passport);
  bearer(passport);
};
