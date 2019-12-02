const dbModel = require("../dbModels/pgDb");
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
    super();
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
  getUser() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.fn_get_user_info('${this.user_name}')`,
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
  getRoles() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.fn_get_roles('${this.user_name}')`,
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
  getHash() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.p_get_set_hash('${this.hash}')`,
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
  create(roleid) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.p_create_new_user('${this.user_name}','${this.password}',${roleid},'${this.hash}')`,
        async (err, results) => {
          if (err) reject(err);
          resolve(results.rows);
        }
      );
    });
  }
  getSetHash(roleid) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.p_get_set_hash('${this.hash}')`,
        async (err, results) => {
          if (err) reject(err);
          resolve(results.rows);
        }
      );
    });
  }
  getByLogin() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.fn_user_exists('${this.user_name}')`,
        async (err, results) => {
          if (err) reject(err);
          resolve(results.rows);
        }
      );
    });
  }
  save(updateDate) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.p_save_user_info('${this.user_name}','${this.password}','${this.hash}',${this.active},'${this.last_name}',
        '${this.first_name}','${this.middle_name}','${this.mobile_number}','${this.email}','${updateDate}')`,
        async (err, results) => {
          if (err) reject(err);
          resolve(results.rows);
        }
      );
    });
  }
  setToken(token, dateCreate) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.p_set_token('${this.user_name}','${token}','${dateCreate}')`,
        async (err, results) => {
          if (err) reject(err);
          resolve(results.rows);
        }
      );
    });
  }
  getToken(token) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.fn_get_token('${token}')`,
        async (err, results) => {
          if (err) reject(err);
          resolve(results.rows);
        }
      );
    });
  }
}
module.exports = User;
