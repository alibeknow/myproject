const express = require('express');
const router = express.Router();
const middleWare = require('../middleWare').middleWare;
const signatureController = require('../controllers/signatureController');
let SignatureController = new signatureController();

module.exports = function() {
  router.get(
    "/signatures/GetSignatures",
    middleWare((req, res, next) =>
      SignatureController.GetSignatures(req, res, next)
    )
  );
  router.post(
    "/signatures/ExtractinfoFromXml",
    middleWare((req, res, next) =>
      SignatureController.extractInfoFromXml(req, res, next)
    )
  );
  return router;
};
