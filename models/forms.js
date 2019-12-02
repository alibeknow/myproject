const dbModel = require("../dbModels/aspCommon");
const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const envConfig = require("../config/system.env")(process.env.NODE_ENV);

const dbConf = require(envConfig.dbpath);

const routines = require("../middleWare");

class Forms extends dbModel {
  constructor(
    formId,
    bin,
    year,
    suppl_id,
    month,
    typeCode,
    statusCode,
    sign,
    records,
    signatures,
    comments,
    senddate
  ) {
    super(dbConf);
    this.formId = formId;
    this.bin = bin;
    this.year = year;
    this.suppl_id = suppl_id;
    this.month = month;
    this.typeCode = typeCode;
    this.statusCode = statusCode;
    this.sign = sign;
    this.records = records;
    this.signatures = signatures;
    this.comments = comments;
    this.senddate = senddate;
  }
  Add() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pSaveUserForm ",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : routines.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("nvcUserName", TYPES.NVarChar, this.bin);
        sqlRequest.addParameter(
          "SiHouseManageId",
          TYPES.SmallInt,
          this.suppl_id
        );
        sqlRequest.addParameter("siYear", TYPES.SmallInt, this.year);
        sqlRequest.addParameter("tiMonth", TYPES.TinyInt, this.month);
        sqlRequest.addParameter("nvcTypeCode", TYPES.NVarChar, this.typeCode);
        if (this.sign !== "undefined")
          sqlRequest.addParameter("bSign", TYPES.NVarChar, this.sign);
        sqlRequest.addParameter(
          "nvcStatusCode",
          TYPES.NVarChar,
          this.statusCode
        );
        if (this.records !== "undefined")
          sqlRequest.addParameter(
            "nvcServListXml",
            TYPES.NVarChar,
            this.records
          );
        connection.callProcedure(sqlRequest);
      });
    });
  }

  GetDetail() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetUserFormsDetail",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? [] : routines.rowsToJSON(rows);
            resolve(result);
          }
        );
        sqlRequest.addParameter("iFormId", TYPES.Int, this.formId);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  GetFormSuppls() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire(function(err, connection) {
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pGetFormSuppls", function(
          err,
          rowCount,
          rows
        ) {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? [] : routines.rowsToJSON(rows);
          resolve(result);
        });
        connection.callProcedure(sqlRequest);
      });
    });
  }
  Update() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pUpdateUserForm",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : routines.rowToJSON(rows[0]);
            resolve(result);
          }
        );

        sqlRequest.addParameter("iFormId", TYPES.Int, this.formId);

        if (this.year !== undefined)
          sqlRequest.addParameter("siYear", TYPES.SmallInt, this.year);
        if (this.month !== undefined)
          sqlRequest.addParameter("tiMonth", TYPES.TinyInt, this.month);
        if (this.sign !== undefined)
          sqlRequest.addParameter("bSign", TYPES.NVarChar, this.sign);
        if (this.senddate !== undefined)
          sqlRequest.addParameter("dtSendDate", TYPES.NVarChar, this.senddate);
        if (this.comments !== undefined)
          sqlRequest.addParameter("nvcComments", TYPES.NVarChar, this.comments);
        if (this.statusCode !== undefined)
          sqlRequest.addParameter(
            "nvcStatusCode",
            TYPES.NVarChar,
            this.statusCode
          );
        if (this.records !== undefined)
          sqlRequest.addParameter(
            "nvcServListXML",
            TYPES.NVarChar,
            this.records
          );

        connection.callProcedure(sqlRequest);
      });
    });
  }

  Get(roleCode, currentPage, pageSize, orderBy) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetUserForms",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? [] : routines.rowsToJSON(rows);
            resolve(result);
          }
        );
        sqlRequest.addParameter("nvcUserName", TYPES.NVarChar, this.bin);
        sqlRequest.addParameter("nvcRoleCode", TYPES.NVarChar, roleCode);
        sqlRequest.addParameter("iPageNumber", TYPES.Int, currentPage);
        sqlRequest.addParameter("iPageSize", TYPES.Int, pageSize);
        sqlRequest.addParameter("nvcOrderBy", TYPES.NVarChar, orderBy);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  GetCurrentPeriod() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetCurrentPeriod",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : routines.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        connection.callProcedure(sqlRequest);
      });
    });
  }

  Approve() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pExecUserForm ",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : routines.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("iFormId", TYPES.Int, this.formId);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  GetSearchFormBy(searchBy, pageSize, currentPage, orderBy) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire(function(err, connection) {
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pGetSearchFormBy", function(
          err,
          rowCount,
          rows
        ) {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? [] : routines.rowsToJSON(rows);
          resolve(result);
        });
        sqlRequest.addParameter("nvcByString", TYPES.NVarChar, searchBy);
        sqlRequest.addParameter("iPageSize", TYPES.Int, pageSize);
        sqlRequest.addParameter("iPageNumber", TYPES.Int, currentPage);
        sqlRequest.addParameter("nvcOrderBy", TYPES.NVarChar, orderBy);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  FilterRecords() {
    return this.records.filter(
      (form_record, index, self) =>
        index !==
        self.findIndex(
          t =>
            t.account_id === form_record.account_id &&
            t.serv_id === form_record.serv_id
        )
    );
  }

  getUserSuppls(
    bin /// получение ИД поставщика услуг
  ) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire(function(err, connection) {
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pGetUserSuppls", function(
          err,
          rowCount,
          rows
        ) {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? [] : routines.rowsToJSON(rows);
          resolve(result);
        });
        sqlRequest.addParameter("cBin", TYPES.Char, bin);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  GetAuthors() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire(function(err, connection) {
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pGetAuthors", function(
          err,
          rowCount,
          rows
        ) {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? [] : routines.rowsToJSON(rows);
          resolve(result);
        });
        connection.callProcedure(sqlRequest);
      });
    });
  }
  GetSupplIdsAuthor() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire(function(err, connection) {
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.GetSupplIdAuthor", function(
          err,
          rowCount,
          rows
        ) {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? [] : routines.rowsToJSON(rows[0]);
          resolve(result);
        });
        connection.callProcedure(sqlRequest);
      });
    });
  }
}
module.exports = Forms;
