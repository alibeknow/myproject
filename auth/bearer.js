const BearerStrategy = require("passport-http-bearer").Strategy;
const jwt = require("jwt-simple");
const userClass = require("../models/users");
const secret = "myBestSecretEver";
const moment = require("moment");
module.exports = function(passport) {
  passport.use(
    "bearer",
    new BearerStrategy(async (token, done) => {
      try {
        let user = new userClass();
        let result = await user.getToken(token);
        let compDate = moment(result.create_token, "hh:mm:ss A")
          .add(5, "minutes")
          .format("LTS");
        let dateobj = new Date();
        let senddate = moment(dateobj.toISOString(), "hh:mm:ss A").format(
          "LTS"
        );
        console.log(senddate, compDate);
        console.log(compDate);
        const resylt = jwt.decode(token, secret);
        return done(null, resylt);
      } catch (error) {
        done(error, false);
      }
    })
  );
};
