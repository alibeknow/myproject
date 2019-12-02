const dbModel = require("../dbModels/pgDb");
const uuidv5 = require("uuid/v5");
const env = require("../config/system.env")(process.env.NODE_ENV);
class Permissions extends dbModel {
  constructor(user_id) {
    super();
    let date = new Date();
    this.uuid = uuidv5(date.toString(), env.mySecret);
    this.user_id = user_id;
  }
  addDoc() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.fn_documents_ins('${this.uuid}','${this.user_id}')`,
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
