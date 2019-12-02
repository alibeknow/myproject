const LocalStrategy = require("passport-local").Strategy;
const userClass = require("../models/users");
const core = require("../core/systemactions.js");
const jwt = require("jwt-simple");
const secret = "myBestSecretEver";
module.exports = function(passport) {
  passport.use(
    "cross-login",
    new LocalStrategy(
      { usernameField: "cryptData", passwordField: "cryptData" },
      async (username, password, done) => {
        let deCryptedData;
        try {
          deCryptedData = await core.decrypt(username);
          deCryptedData = JSON.parse(deCryptedData);
        } catch (error) {
          return done(error);
        }
        let resultuser;
        let user = new userClass(deCryptedData.login);
        try {
          resultuser = await user.GetByLogin();
        } catch (error) {
          return done(error.message, false);
        }

        if (!resultuser.result) {
          let hash = await core.setHash(
            core.generateRandomString(10 + new Date())
          );
          user.password = hash;
          user.hash = hash + new Date().toString();
          user.username = deCryptedData.login;

          try {
            user.role_code = "rUser";
            user.Create(3); ///ROLE PhysucalUser
            let token = jwt.encode(deCryptedData.login, secret);
            let dateobj = new Date();
            let senddate = dateobj.toISOString();
            await user.setToken(token, senddate);
            return done(false, token);
          } catch (error) {
            return done(error, null);
          }
        }
        let token = jwt.encode(deCryptedData.login, secret);
        let dateobj = new Date();
        let senddate = dateobj.toISOString();
        await user.setToken(token, senddate);
        return done(null, token);
      }
    )
  );
};
