const dbModel = require("../dbModels/pgDb");

class Permissions extends dbModel {
  constructor(
    action_id,
    module_id,
    user_id,
    role_id,
    permission_id,
    act_perm_id
  ) {
    super();
    this.act_perm_id = act_perm_id;
    this.permission_id = permission_id;
    this.action_id = action_id;
    this.module_id = module_id;
    (this.user_id = user_id), (this.role_id = role_id);
  }

  addRoleAction(docid) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.p_add_role_action('${this.user_name}','${this.role_id}',${this.action_id},${this.module_id},'${docid}')`,
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
  delRoleAction(docid) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.p_del_role_action('${this.role_id}','${this.action_id}',${this.module_id},${docid})`,
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
  getUserActions() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.fn_get_user_actions('${this.user_id}')`,
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
  roleActionExists(moduleCode, ActionCode) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.fn_role_action_exists('${this.user_id}','${moduleCode}','${ActionCode}')`,
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
  getRoleActions() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.fn_get_role_actions('${this.role_id}')`,
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
  getRoles() {
    return new Promise((resolve, reject) => {
      this.pool.query(
        `select * from access.fn_get_roles('${this.user_id}')`,
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
