const dbModel = require("../dbModels/aspCommon");
const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const envConfig = require("../config/system.env")(process.env.NODE_ENV);
const dbConf = require(envConfig.dbpath);
const core = require("../core/systemactions");
const middleWare = require("../middleWare");

class User extends dbModel {
  constructor(
    user_name,
    password,
    hash,
    active,
    last_name,
    first_name,
    middle_name,
    mobile_number,
    email,
    role_code,
    bin,
    user_id,
    supplId,
    services
  ) {
    super(dbConf);
    this.user_name = core.replaceSpaces(user_name);
    this.password = password;
    this.hash = hash;
    this.active = active;
    this.bin = bin;
    this.user_id = user_id;
    this.last_name = core.replaceSpaces(last_name);
    this.first_name = core.replaceSpaces(first_name);
    this.middle_name = core.replaceSpaces(middle_name);
    this.mobile_number = core.replaceSpaces(mobile_number);
    this.email = core.replaceSpaces(email);
    this.role_code = role_code;
    this.supplId = supplId; //Код организации
    this.services = services; //Коды оказываемых услуг
  }

  Update() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pSaveUserInfo",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("nvcUserName", TYPES.NVarChar, this.user_name);
        if (this.last_name)
          sqlRequest.addParameter(
            "nvcLastName",
            TYPES.NVarChar,
            this.last_name
          );
        if (this.first_name)
          sqlRequest.addParameter(
            "nvcFirstName",
            TYPES.NVarChar,
            this.first_name
          );
        if (this.middle_name)
          sqlRequest.addParameter(
            "nvcMiddleName",
            TYPES.NVarChar,
            this.middle_name
          );
        if (this.mobile_number)
          sqlRequest.addParameter(
            "nvcMobileNumber",
            TYPES.NVarChar,
            this.mobile_number
          );
        if (this.active)
          sqlRequest.addParameter("bActive", TYPES.NVarChar, this.active);

        sqlRequest.addParameter("vcHash", TYPES.NVarChar, this.hash);
        if (this.password)
          sqlRequest.addParameter("nvcPassword", TYPES.NVarChar, this.password);
        if (this.email)
          sqlRequest.addParameter("nvcEmail", TYPES.NVarChar, this.email);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  GetByLogin() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);

        let sqlRequest = new Request(
          "aspCommon.dbo.pUserExists",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
            resolve(result);
          }
        );

        sqlRequest.addParameter("nvcUserName", TYPES.NVarChar, this.user_name);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  Create(roleId) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pCreateNewUser",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("nvcUserName", TYPES.NVarChar, this.user_name);
        sqlRequest.addParameter("nvcPassword", TYPES.NVarChar, this.password);
        sqlRequest.addParameter("iRoleid", TYPES.Int, roleId);
        sqlRequest.addParameter("vcHash", TYPES.VarChar, this.hash);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  Confirm() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetSetHash",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("vcHash", TYPES.VarChar, this.hash);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  Get() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetUserInfo",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("cBin", TYPES.Char, this.user_name);
        connection.callProcedure(sqlRequest);
      });
    });
  }

  Delete() {}
  ///////////////поставщики

  Check() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pCheckSuppl",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("cBin", TYPES.Char, this.user_name);
        sqlRequest.addParameter("vcEmail", TYPES.VarChar, this.email);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  getServices() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetSupplServs",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result;
            result = rows.length === 0 ? {} : middleWare.rowsToJSON(rows);
            resolve(result);
          }
        );
        sqlRequest.addParameter("siSupplId", TYPES.Char, this.supplId);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  checkAccount(accountId) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pCheckAccountSuppl",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);

            let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("siSupplId", TYPES.SmallInt, this.supplId);
        sqlRequest.addParameter("iAccountId", TYPES.Int, accountId);
        sqlRequest.addParameter("siServId", TYPES.SmallInt, this.services);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  getSupplyId() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetUserSuppls",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? [] : middleWare.rowsToJSON(rows);
            resolve(result);
          }
        );
        sqlRequest.addParameter("cBin", TYPES.Char, this.user_name);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  getSupplAccounts(xml, currentPage, pageSize, orderBy) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetSupplAccounts",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? [] : middleWare.rowsToJSON(rows);
            resolve(result);
          }
        );
        sqlRequest.addParameter("nvcAddressList", TYPES.NVarChar, xml);
        sqlRequest.addParameter("siSupplId", TYPES.Int, this.supplId);
        sqlRequest.addParameter("iPageNumber", TYPES.Int, currentPage);
        sqlRequest.addParameter("iPageSize", TYPES.Int, pageSize);
        sqlRequest.addParameter("nvcOrderBy", TYPES.NVarChar, orderBy);
        connection.callProcedure(sqlRequest);
      });
    });
  }

  getSupplAddresses() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetSupplAddresses",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? [] : middleWare.rowsToJSON(rows);
            resolve(result);
          }
        );
        sqlRequest.addParameter("siSupplId", TYPES.Int, this.supplId);

        connection.callProcedure(sqlRequest);
      });
    });
  }

  getUserAccounts() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetUserAccounts ",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? [] : middleWare.rowsToJSON(rows);
            resolve(result);
          }
        );
        sqlRequest.addParameter("nvcUserName", TYPES.NVarChar, this.user_name);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  getToken(token) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetToken ",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("vcToken", TYPES.VarChar, token);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  setToken(token, dateCreate) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pSetToken ",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? [] : middleWare.rowsToJSON(rows);
            resolve(result);
          }
        );
        sqlRequest.addParameter("nvcUserName", TYPES.NVarChar, this.user_name);
        sqlRequest.addParameter("vcToken", TYPES.VarChar, token);
        sqlRequest.addParameter("dtCreateToken", TYPES.NVarChar, dateCreate);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  getPersonalInfo() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetPersUserInfo ",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
            resolve(result);
          }
        );
        sqlRequest.addParameter("nvcUserName", TYPES.NVarChar, this.user_name);

        connection.callProcedure(sqlRequest);
      });
    });
  }

  searchBy(bystrimg, pagenumber, pagesize, orderby) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) => {
        if (err) reject(err);
        let sqlRequest = new Request(
          "aspCommon.dbo.pGetSearchUserBy",
          (err, rowCount, rows) => {
            connection.release();
            if (err) reject(err);
            let result = rows.length === 0 ? [] : middleWare.rowsToJSON(rows);
            resolve(result);
          }
        );
        sqlRequest.addParameter("nvcByString", TYPES.Char, bystrimg);
        sqlRequest.addParameter("iPageNumber", TYPES.Char, pagenumber);
        sqlRequest.addParameter("iPageSize", TYPES.Char, pagesize);
        sqlRequest.addParameter("nvcOrderBy", TYPES.Char, orderby);
        connection.callProcedure(sqlRequest);
      });
    });
  }
}
module.exports = User;
