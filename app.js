const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const cors = require("./middleWare").cors;
const app = express();
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true
  })
);
app.use(bodyParser.json());

app.use(require("cookie-parser")());
//Set Session settings

app.use(
  session({
    secret: "keyboard cat",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
      httpOnly: false
    }
  })
);
app.use((req, res, next) => cors(res, req, next));
app.use(passport.initialize());
app.use(passport.session());
// Initialize Passport

//cors MIDDLEWARE

// Initialize Passport
let initPassport = require("./auth/init");
initPassport(passport);
let userRoutes = require("./routes/usersRoutes")(passport);
let filesRoutes = require("./routes/filesRoutes")();
let signaturesRoutes = require("./routes/signaturesRoutes")();
let formRoutes = require("./routes/formsRoutes")();
let permRoutes = require("./routes/permRoutes")();

app.use("/api", userRoutes);
app.use("/api", filesRoutes);
app.use("/api", formRoutes);
app.use("/api", signaturesRoutes);
app.use("/api", permRoutes);

////ERRROR WRITE TO LOG
app.use("/apidoc", express.static(path.join(__dirname, "apidoc")));
app.use((req, res, next) => {
  if (!res.locals.result)
    return res
      .status(404)
      .send({ successful: false, message: "doesnt have that page" });
  else return res.send(res.locals.result);
});
app.use((err, req, res, next) => {
  return res.status(500).send({ successful: false, message: err.message });
});
///////////GLOBAL ERROR HANDLER
process.on("uncaughtException", function(err) {
  console.log("UNCAUGHT EXCEPTION ");
  console.log("[Inside 'uncaughtException' event] " + err.stack || err.message);
});

module.exports = app;
