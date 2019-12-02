const tediousConnectionPool = require("tedious-connection-pool");
const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const middleWare = require("../middleWare");

class dbAspCommon {
  constructor(config) {
    this.connectionPool = new tediousConnectionPool(
      config.pool,
      config.connection
    );
    this.config = config;
    this.connectionPool.on("error", err => {
      console.log(err);

      this.connectionPool.drain();
      this.poolDrained = true;
      process.kill(process.pid, "SIGINT"); //tells us to shutdown gracefully
      return err;
    });
  }
  Create() {
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
        sqlRequest.addParameter("nvcuser_name", TYPES.VarChar, this.login);
        sqlRequest.addParameter("nvcPassword", TYPES.VarChar, this.password);
        sqlRequest.addParameter("iRoleid", TYPES.Int, this.roleId);
        sqlRequest.addParameter("vcHash", TYPES.VarChar, this.hash);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  Update() {
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
        sqlRequest.addParameter("nvcuser_name", TYPES.VarChar, this.login);
        sqlRequest.addParameter("nvcPassword", TYPES.VarChar, this.password);
        sqlRequest.addParameter("iRoleid", TYPES.Int, this.roleId);
        sqlRequest.addParameter("vcHash", TYPES.VarChar, this.hash);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  Get(tableName, select, whereClause, OrderBy, PageNumber, PageSize) {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire(function(err, connection) {
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pUniGet", function(
          err,
          rowCount,
          rows
        ) {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? [] : middleWare.rowsToJSON(rows[0]);
          resolve(result);
        });
        sqlRequest.addParameter("nvcTableName", TYPES.NVarChar, tableName);
        sqlRequest.addParameter("nvcColumnList", TYPES.NVarChar, select);
        sqlRequest.addParameter("nvcWhere", TYPES.Int, whereClause);
        sqlRequest.addParameter("NvcOrderBy", TYPES.Int, OrderBy);
        sqlRequest.addParameter("iPageNumber", TYPES.Int, PageNumber);
        sqlRequest.addParameter("iPageSize", TYPES.Int, PageSize);

        connection.callProcedure(sqlRequest);
      });
    });
  }

  Delete() {
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
        sqlRequest.addParameter("nvcuser_name", TYPES.VarChar, this.login);
        sqlRequest.addParameter("nvcPassword", TYPES.VarChar, this.password);
        sqlRequest.addParameter("iRoleid", TYPES.Int, this.roleId);
        sqlRequest.addParameter("vcHash", TYPES.VarChar, this.hash);
        connection.callProcedure(sqlRequest);
      });
    });
  }
}

module.exports = dbAspCommon;
