const dbModel = require("../dbModels/pgDb");

class Logs extends dbModel {
  constructor(user_id, moduleCode, action, successful, request, response) {
    super();
    this.user_id = user_id;
    this.moduleCode = moduleCode;
    this.action = action;
    this.successful = successful;
    this.request = request;
    this.response = response;
  }
  Add(actionResult, request, response) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from audit.p_insert_log('${this.user_id}','${this.moduleCode}','${this.action}',${actionResult},'${request}','${response}')`,
        async (err, results) => {
          if (err) {
            //err = await convert.getDBError(req.locale.region, err);
            reject(err);
          } else {
            resolve(results.rows);
          }
        }
      );
    });
  }
}
module.exports = Logs;
