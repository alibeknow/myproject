const express = require("express");
const router = express.Router();
const middleWare = require("../middleWare").middleWare;
const cors = require("../middleWare").cors;

module.exports = function(passport) {
  //////USER ACTIONS
  const userController = require("../controllers/usersController")(passport);
  // Register
  /* Handle Registration POST */
  router.put("/users/signup", (req, res, next) =>
    userController.signup(req, res, next)
  );
  router.post("/users/verify", (req, res, next) =>
    userController.verify(req, res, next)
  );
  router.post("/users/login", (req, res, next) =>
    userController.login(req, res, next)
  );
  // Logout
  router.post("/users/logout", (req, res, next) =>
    userController.logout(req, res, next)
  );
  ///генерация ХЭША
  router.post("/users/sendHash", (req, res, next) =>
    userController.sendhash(req, res, next)
  );
  router.get(
    "/users/get",
    middleWare((req, res, next) => userController.getUserInfo(req, res, next))
  );
  router.post(
    "/users/update",
    middleWare((req, res, next) => userController.saveUserInfo(req, res, next))
  );
  router.put(
    "/users/add",
    middleWare((req, res, next) => userController.addUser(req, res, next))
  );
  router.get(
    "/users/getRoles",
    middleWare((req, res, next) => userController.getRoles(req, res, next))
  );
  router.post(
    "/users/checkAccountSuppl",
    middleWare((req, res, next) =>
      userController.checkAccountSuppl(req, res, next)
    )
  );
  router.get(
    "/users/getServiceProvider",
    middleWare((req, res, next) =>
      userController.getServiceProvider(req, res, next)
    )
  );
  router.get(
    "/users/getUserSuppl",
    middleWare((req, res, next) => userController.getUserSuppl(req, res, next))
  );
  router.post("/users/checkHash", (req, res, next) =>
    userController.checkHash(req, res, next)
  );
  router.post("/users/crossLogin", (req, res, next) =>
    userController.crossLogin(req, res, next)
  );
  router.get(
    "/users/getSupplAddresses",
    middleWare((req, res, next) =>
      userController.getSupplAddresses(req, res, next)
    )
  );
  router.post(
    "/users/getSupplAccounts",
    middleWare((req, res, next) =>
      userController.getSupplAccounts(req, res, next)
    )
  );
  router.get(
    "/users/getUserAccounts",
    passport.authenticate("bearer", { session: false }),
    (req, res, next) => userController.getUserAccounts(req, res, next)
  );
  router.get(
    "/users/getPersonalInfo",
    passport.authenticate("bearer", { session: false }),
    (req, res, next) => userController.getPersonalInfo(req, res, next)
  );
  return router;
  ////////USERS ACTION ON SITE
};
