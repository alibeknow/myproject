const dbModel = require("../dbModels/pgDb");

class Form extends dbModel {
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
    super();
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
  getUserForms(roleCode, pagenumber = 1, pagesize = 20, orderby = "1 desc") {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.fn_get_user_forms('${this.user_name}','${roleCode}',${pagenumber},${pagesize},'${orderby}')`,
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
  getDetail() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.fn_get_user_forms_detail('${this.formId}')`,
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
  saveUserForm(username, docid) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.p_save_user_form('${username}',${this.suppl_id},${this.year},${this.month},
        ${this.sign},'${this.typeCode}','${this.statusCode}','${this.records}','${docid}')`,
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
  getAuthors() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.fn_get_authors()`,
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
  updateUserForm(uuid) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.p_update_user_form('${uuid}','${this.formId}',${this.suppl_id},${this.year},${this.month},${this.sign},${this.statusCode},${this.senddate},${this.comments},'${this.records}')`,
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
  GetFormSuppls() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.fn_get_form_suppls()`,
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
  getFormsBy(whereClause, pageNumber = 1, pageSize = 20, orderBy = "1 desc") {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from public.fn_get_search_form_by('${whereClause}',${pageNumber},'${pageSize}','${orderBy}')`,
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
module.exports = Form;
