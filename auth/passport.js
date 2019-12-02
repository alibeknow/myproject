var LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const userClass = require("../models/users");

module.exports = function(passport) {
  passport.use(
    "local-login",
    new LocalStrategy(
      { usernameField: "login", passwordField: "password" },
      async (username, password, done) => {
        let resultuser;
        let user = new userClass(username);
        let arrayRules = [];
        try {
          resultuser = await user.GetByLogin();
          //resultuser=arrayRules[0];
        } catch (error) {
          return done(error.message, false);
        }

        if (!resultuser.result) {
          return done(
            null,
            false,
            `Пользователя с логином ${username} не существует`
          );
        } else if (resultuser.active == 0) {
          return done(
            null,
            false,
            `Активируйте учётную запись пользователя ${username} по email`
          );
        }
        bcrypt.compare(password, resultuser.password, (err, result) => {
          return result
            ? done(null, resultuser)
            : done(null, false, "Неверный пароль");
        });
      }
    )
  );
};
