const express = require("express");
const router = express.Router();
const middleWare=require("../middleWare").middleWare;
const permController = require("../controllers/permissionsController");
let PermController = new permController();


module.exports = function() {
  router.put("/permissions/add", middleWare((req, res, next) =>
  PermController.addRoleAction(req, res, next)
  ));
  router.delete("/permissions/delete", middleWare((req, res, next) =>
  PermController.deleteRoleAction(req, res, next)
  ));
  router.get("/permissions/get", middleWare((req, res, next) =>
  PermController.getRoleAction(req, res, next)
  ));
  router.get("/permissions/getRoleActionsByUser", middleWare((req, res, next) =>
  PermController.getRoleActionsByUser(req, res, next)
  ));

  return router;
};
