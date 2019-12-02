const express = require("express");
const router = express.Router();
const middleWare = require("../middleWare").middleWare;
const fileController = require("../controllers/filesController");
const multer = require("multer");
let FileController = new fileController();
let storage = multer.memoryStorage();
let upload = multer({ storage: storage });

module.exports = function() {
  router.put(
    "/files/add",
    upload.array("file_body", 3),
    middleWare((req, res, next) => FileController.addFile(req, res, next))
  );
  router.get(
    "/files/get",
    middleWare((req, res, next) => FileController.getById(req, res, next))
  );
  router.get(
    "/files/getFileById",
    middleWare((req, res, next) => FileController.getFileById(req, res, next))
  );
  router.get(
    "/files/getUserFiles",
    middleWare((req, res, next) => FileController.getUserFiles(req, res, next))
  );
  router.get(
    "/files/getFiles",
    middleWare((req, res, next) => FileController.getFiles(req, res, next))
  );
  router.delete(
    "/files/delete",
    middleWare((req, res, next) => FileController.deleteFile(req, res, next))
  );
  return router;
};
