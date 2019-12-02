const dbModel = require("../dbModels/aspCommon");
const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const envConfig=require("../config/system.env")(process.env.NODE_ENV);

const dbConf=require(envConfig.dbpath);
const routines =require("../middleWare");

class Signature extends dbModel{
    constructor() {
        super(dbConf)
        }
        
GetSignatures(user_id,module_code,entity_id)
{
  return new Promise((resolve, reject) => {
    this.connectionPool.acquire(function(err, connection) {
      if (err) reject(err);
      let sqlRequest = new Request("aspCommon.dbo.pGetSignatures", function(
        err,
        rowCount,
        rows
      ) {
        connection.release();
        if (err) reject(err);
        let result = rows.length === 0 ? [] : routines.rowsToJSON(rows);
        resolve(result);
      });
      sqlRequest.addParameter("iUserId", TYPES.Int, user_id);
      sqlRequest.addParameter("nvcModuleCode", TYPES.NVarChar, module_code);
      sqlRequest.addParameter("iEntityId", TYPES.Int, entity_id);
        connection.callProcedure(sqlRequest);
    });
  });
}
AddSign(user_id,signedXml,entityId,signInfo,dateCreate,moduleCode="mdlForms")
  {
    return new Promise((resolve, reject) => {
      this.connectionPool.acquire(function(err, connection) {
        if (err) reject(err);
        let sqlRequest = new Request("aspCommon.dbo.pAddSignature", function(
          err,
          rowCount,
          rows
        ) {
          connection.release();
          if (err) reject(err);
          let result = rows.length === 0 ? {} : routines.rowToJSON(rows[0]);
          resolve(result);
        });
        sqlRequest.addParameter("iUserId", TYPES.Int, user_id);
        sqlRequest.addParameter("nvcSignBody", TYPES.NVarChar, signedXml);
        sqlRequest.addParameter("nvcSignInfo", TYPES.NVarChar, signInfo);
        sqlRequest.addParameter("dtDateCreate", TYPES.NVarChar, dateCreate);
        sqlRequest.addParameter("iEntityId",   TYPES.Int, entityId);
        sqlRequest.addParameter("nvcModuleCode", TYPES.NVarChar, moduleCode);
          connection.callProcedure(sqlRequest);
      });
    });
  }


}
module.exports=Signature;