const dbModel = require("../dbModels/aspCommon");
const Request = require("tedious").Request;
const envConfig=require("../config/system.env")(process.env.NODE_ENV);

const dbConf=require(envConfig.dbpath);
const TYPES = require("tedious").TYPES;
const middleWare =require("../middleWare");

class Permissions extends dbModel{

  constructor(action_id,module_id,user_id,role_id,permission_id,act_perm_id) {
    super(dbConf)
    this.act_perm_id=act_perm_id;
    this.permission_id=permission_id;
    this.action_id=action_id;
    this.module_id=module_id;
    this.user_id=user_id,
    this.role_id=role_id
    }

getRoles() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) =>{
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pGetRoles", (
          err,
          rowCount,
          rows
        ) =>{
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
          resolve(result);
        });
        connection.callProcedure(sqlRequest);
      });
    });
  }
  addPermission() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) =>{
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pAddPermissions", (
          err,
          rowCount,
          rows
        ) =>{
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
          resolve(result);
        });
        sqlRequest.addParameter("iUserId", TYPES.Int, this.user_id);
        sqlRequest.addParameter("iModuleId", TYPES.Int, this.moduleCode);
        sqlRequest.addParameter("iActionId", TYPES.Int, this.action);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  addRoleAction() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) =>{
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pAddRoleAction", (
          err,
          rowCount,
          rows
        ) =>{
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
          resolve(result);
        });
        sqlRequest.addParameter("iRoleId", TYPES.Int, this.user_id);
        sqlRequest.addParameter("iModulId", TYPES.Int, this.module_id);
        sqlRequest.addParameter("iActionId", TYPES.NVarChar, this.action_id);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  deletePermission() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) =>{
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pDelPermission", (
          err,
          rowCount,
          rows
        )=> {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
          resolve(result);
        });
        sqlRequest.addParameter("iPermissionId", TYPES.Int, this.permission_id);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  deleteRoleAction() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) =>{
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pDelPermission", (
          err,
          rowCount,
          rows
        )=> {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
          resolve(result);
        });
        sqlRequest.addParameter("iRoleId", TYPES.Int, this.user_id);
        sqlRequest.addParameter("nvcActionCode", TYPES.NVarChar, this.action);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  getPermission() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) =>{
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pGetPermission", (
          err,
          rowCount,
          rows
        ) =>{
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? [] : middleWare.rowsToJSON(rows);
          resolve(result);
        });
        sqlRequest.addParameter("iPermissionId", TYPES.Int, this.permission_id);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  getUserActions() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) =>{
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pGetUserActions", (
          err,
          rowCount,
          rows
        ) =>{
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? [] : middleWare.rowsToJSON(rows);
          resolve(result);
        });
        sqlRequest.addParameter("iUserId", TYPES.Int, this.user_id);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  
  roleActionExists(nvcModule,nvcAction)
  {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) =>{
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pRoleActionExists", (
          err,
          rowCount,
          rows        )=> {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? {} : middleWare.rowToJSON(rows[0]);
          resolve(result);
        });
        sqlRequest.addParameter("iUserId", TYPES.Int, this.user_id);
        sqlRequest.addParameter("nvcModuleCode", TYPES.NVarChar, nvcModule);
        sqlRequest.addParameter("nvcActionCode", TYPES.NVarChar, nvcAction);
        connection.callProcedure(sqlRequest);
      });
    });
  }
  getRoleAction() {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire((err, connection) =>{
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pGetRoleActions", (
          err,
          rowCount,
          rows        )=> {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? [] : middleWare.rowsToJSON(rows);
          resolve(result);
        });
        sqlRequest.addParameter("iRoleId", TYPES.Int, this.role_id);
        connection.callProcedure(sqlRequest);
      });
    });
  }

}

module.exports=Permissions;