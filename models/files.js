const dbModel = require("../dbModels/aspCommon");
const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const routines = require("../middleWare");
const envConfig = require("../config/system.env")(process.env.NODE_ENV);

const dbConf = require(envConfig.dbpath);

class Files extends dbModel {
  constructor(
    file_id,
    fileName,
    fileBody,
    date_create,
    author_id,
    fileExt,
    status_Id,
    module_code
  ) {
    super(dbConf);
    this.file_id = file_id;
    this.fileBody = fileBody;
    this.date_create = date_create;
    this.author_id = author_id;
    this.fileName = fileName;
    this.fileExt = fileExt;
    this.status_Id = status_Id;
    this.module_code = module_code;
  }
  Add(entityId) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pAddFile",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : routines.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("iUserId", TYPES.Int, this.author_id);
        sqlRequest.addParameter("iEntityId", TYPES.Int, entityId);
        sqlRequest.addParameter("vbFileBody", TYPES.VarBinary, this.fileBody);
        sqlRequest.addParameter(
          "dtDateCreate",
          TYPES.NVarChar,
          this.date_create
        );
        sqlRequest.addParameter("nvcFileName", TYPES.NVarChar, this.fileName);
        sqlRequest.addParameter("nvcFileExt", TYPES.NVarChar, this.fileExt);
        sqlRequest.addParameter(
          "nvcModuleCode",
          TYPES.NVarChar,
          this.module_code
        );
        sqlRequest.addParameter("nvcStatusCode", TYPES.NVarChar, "sAccepted");

        connection.callProcedure(sqlRequest);
      });
    });
  }
  Delete() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pDeleteFile",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : routines.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("iFileId", TYPES.Int, this.file_id);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  Get() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetUserFiles",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? [] : routines.rowsToJSON(rows);
            resolve(result);
          }
        );
        sqlRequest.addParameter("cBin", TYPES.NVarChar, this.ownerBin);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  GetById(anotherFileDb_id) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetDocById",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : routines.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("iAttachId", TYPES.BigInt, anotherFileDb_id);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  GetOwn() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetFileById",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : routines.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("iFileId", TYPES.Int, this.file_id);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  getUserSupplDocs(bin) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetUserSupplDocs",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);

            let result;
            if (rows) {
              result = rows.length === 0 ? [] : routines.rowsToJSON(rows);
            } else {
              result = {};
            }

            resolve(result);
          }
        );
        sqlRequest.addParameter("cBin", TYPES.Char, bin);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  GetFiles(entity_id, modulecode = "mdlForms") {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetFiles",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? [] : routines.rowsToJSON(rows);
            resolve(result);
          }
        );

        sqlRequest.addParameter("iUserId", TYPES.Int, this.author_id);
        sqlRequest.addParameter("nvcModuleCode", TYPES.NVarChar, modulecode);
        sqlRequest.addParameter("iEntityId", TYPES.Int, entity_id);
        connection.callProcedure(sqlRequest);
      });
    });
  }
}
module.exports = Files;
