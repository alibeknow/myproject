const dbModel = require("../dbModels/pgDb");
const uuidv5 = require("uuid/v5");
const env = require("../config/system.env")(process.env.NODE_ENV);
class signature extends dbModel {
  constructor() {
    super();
    let date = new Date();
    this.uuid = uuidv5(date.toString(), env.mySecret);
  }
  addSignature(
    user_id,
    signBody,
    signInfo,
    dateCreate,
    ModuleCode,
    entityId,
    docId
  ) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.public.p_add_signature('${this.uuid}','${user_id}','${signBody}','${signInfo}','${dateCreate}','${ModuleCode}'
        ,'${entityId}','${docId}')`,
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
  GetSignatures(user_id, ModuleCode, entityId) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.fn_get_signatures('${user_id}','${ModuleCode}','${entityId}')`,
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
  GetById() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.fn_get_signature_by_id('${this.uuid}')`,
        async (err, results) => {
          if (err) {
            //err = await convert.getDBError(req.locale.region, err);
            reject(err);
          } else {
            resolve(results.rows[0]);
          }
        }
      );
    });
  }
}
module.exports = signature;
