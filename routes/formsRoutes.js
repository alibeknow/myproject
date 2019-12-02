const express = require("express");
const router = express.Router();
const middleWare=require("../middleWare").middleWare;
const formController = require("../controllers/formsController");
let FormController = new formController();

module.exports = function() {
  
  router.put("/forms/add", middleWare((req, res, next) =>
    FormController.saveUserForm(req, res, next)
  ));
  router.get("/forms/get", middleWare((req, res, next) =>
    FormController.get(req, res, next))
  );
  router.post("/forms/update", middleWare((req, res, next) =>
    FormController.UpdateUserForm(req, res, next)
  ));
  router.post("/forms/UpdateStatusAtWork", middleWare((req, res, next) =>
  FormController.UpdateStatusAtWork(req, res, next)
));
router.post("/forms/UpdateStatusAccepted", middleWare((req, res, next) =>
FormController.UpdateStatusAccepted(req, res, next)
));
router.post("/forms/UpdateStatusSended", middleWare((req, res, next) =>
FormController.UpdateStatusSended(req, res, next)
));
router.post("/forms/UpdateStatusRejected", middleWare((req, res, next) =>
FormController.UpdateStatusRejected(req, res, next)
));
router.post("/forms/UpdateStatusDeleted", middleWare((req, res, next) =>
FormController.UpdateStatusDeleted(req, res, next)
));

  router.post("/forms/approve", middleWare((req, res, next) =>
    FormController.approve(req, res, next)
  ));
  router.get("/forms/getSupplIdsAuthors", middleWare((req, res, next) =>
  FormController.GetSupplIdsAuthor(req, res, next)
));

  router.post("/forms/duplicateDetect", middleWare((req, res, next)=>
    FormController.FilterRecords(req, res, next)
  ));
  router.post("/forms/getCurrentPeriod", middleWare((req, res, next) =>
    FormController.getCurrentPeriod(req, res, next)
  ));
  router.get("/forms/getDetail", middleWare((req, res, next) =>
    FormController.getUserFormDetail(req, res, next)
  ));
  router.post("/forms/recordstoXml", middleWare((req, res, next) =>
    FormController.RecordsToXml(req, res, next)
  ));
  router.get("/forms/GetAuthors", middleWare((req, res, next) =>
  FormController.GetAuthors(req, res, next)
  ));
  router.get("/forms/download", (req, res, next) =>
  FormController.downloadForm(req, res, next)
  );

  return router;
};
