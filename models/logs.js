const dbModel = require("../dbModels/aspCommon");
const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const envConfig=require("../config/system.env")(process.env.NODE_ENV);

const dbConf=require(envConfig.dbpath);

class Logs extends dbModel{

    constructor(user_id,moduleCode,action,successful,request,response) {
        super(dbConf);
        this.user_id=user_id;
        this.moduleCode=moduleCode;
        this.action=action;
        this.successful=successful;
        this.request=request;
        this.response=response;
    }

    Add()
    {
        return new Promise((resolve, reject) => {
            this.connectionPool.acquire((err, connection)=> {
              if (err) reject(err);
              let sqlRequest = new Request("aspCommon.dbo.pInsertLog", (
                err,
                rowCount,
                rows
              )=> {
                connection.release();
                if (err) reject(err);

              });
              sqlRequest.addParameter("iUserId", TYPES.Int, this.user_id);
              sqlRequest.addParameter("nvcModuleCode", TYPES.NVarChar, this.moduleCode);
              sqlRequest.addParameter("nvcActionCode", TYPES.NVarChar, this.action);
              sqlRequest.addParameter("bActionResult", TYPES.Int, this.successful);
              sqlRequest.addParameter("nvcRequest", TYPES.NVarChar, this.request);
              sqlRequest.addParameter("nvcResponse", TYPES.NVarChar, this.response);
              connection.callProcedure(sqlRequest);
            });
          });
    }

}

module.exports=Logs;