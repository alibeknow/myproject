const dbModel = require("../dbModels/pgDb");
const core = require("../core/systemactions");

class files extends dbModel {
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
    super();
    this.file_id = file_id;
    this.fileBody = fileBody;
    this.date_create = date_create;
    this.author_id = author_id;
    this.fileName = fileName;
    this.fileExt = fileExt;
    this.status_Id = status_Id;
    this.module_code = module_code;
  }
  add(uuid, entityId, docid) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.p_add_file('${this.file_id}','${this.user_name}','sAccepted',${this.fileBody}
        ,'${this.fileName}','${this.date_create}','${this.fileExt}','${this.module_code}',${entityId},'${docid}')`,
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
  delete(docid) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.p_delete_file('${this.file_id}','${docid}')`,
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
  getFiles(entityId) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.fn_get_file('${this.author_id}','${this.module_code}',${entityId})`,
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
  getFileById() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.fn_get_file_by_id('${this.file_id}')`,
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
module.exports = files;
