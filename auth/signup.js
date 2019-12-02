const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const usersClass = require("../models/users");

module.exports = function(passport) {
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "bin",
        passwordField: "password",
        passReqToCallback: true
      },
      async (req, login, password, done) => {
        let { email, bin } = req.body;
        let errors = [];
        let result;
        email = email.trim().replace(" ", "");
        login = login.trim().replace(" ", "");
        bin = bin.trim().replace(" ", "");
        let User = new usersClass();
        User.email = email;
        User.user_name = login;
        User.bin = bin;
        try {
          result = await User.GetByLogin();
        } catch (error) {
          return done(error, false);
        }
        if (result.result) {
          errors.push(`Пользователь с БИН:${bin} уже существует`);
          return done(null, false, errors);
        }
        try {
          result = await User.Check();
        } catch (error) {
          return done(null, false, errors);
        }

        if (!result.result) {
          errors.push(
            `Поставщика с БИН:${bin} и email: ${email} не существует`
          );
          return done(null, false, errors);
        }
        if (result.error_code) {
          errors.push(
            `Поставщик с БИН:${bin} имеет множество e-mail адресов, пожалуйста обратитесь в АО «АЛСЕКО» для обновления информации`
          );

          return done(null, false, errors);
        }

        if (errors.length > 0) {
          return done(null, false, errors);
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            var secretHash = Math.floor(Date.now() / 1000) + password;
            bcrypt.hash(secretHash, salt, null, (err, hasher) => {
              secretHash = hasher;
            });

            bcrypt.hash(password, salt, null, async (err, hash) => {
              if (err) throw err;
              password = hash;
              try {
                User.hash = secretHash;
                User.password = password;
                result = await User.Create(3);
              } catch (error) {
                return done(error, false);
              }
              if (result) {
                let obj = {};
                obj.hash = User.hash;
                obj.password = User.password;
                return done(null, obj);
              } else {
                return done(null, false, "Error Connect");
              }
            });
          });
        }
      }
    )
  );
};
