const beautifyResponse = require("../middleWare").beautifyResponse;
const permissions = require("../models/permissions");
const coreFunc = require("../core/systemactions");

class permissionsController {
  async addRoleAction(req, res, next) {
    /**
     * @api {put} api/permissions/add  – Добавление прав Для роли
     * @apiVersion 1.0.0
     * @apiName add
     * @apiGroup permissions
     *
     * @apiParam    {Number} role_id                           ИД роли
     * @apiParam    {Number} action_id                         ИД действия с модуля
     * @apiParam    {Number} module_id                         ИД Модуля
     *
     *
     *
     * @apiSuccess  {boolean} result : true ? false                 Возвращает true или false
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *    {        "successful": true,        "message": "ok",        "data": null,        "errCode": null    }
     *
     *
     *
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    let { role_id, action_id, module_id } = req.body;
    let permClass = new permissions();
    if (role_id && action_id && module_id) {
      permClass.user_id = role_id;
      permClass.action_id = action_id;
      permClass.module_id = module_id;
      let result = permClass.addRoleAction();
      if (!result)
        return res.send(beautifyResponse(false, "Permissions add Error"));
      else return res.send(beautifyResponse(true));
    } else {
      return res.send(beautifyResponse(false, "Не заполнены поля"));
    }
  }
  async deleteRoleAction(req, res, next) {
    /**
     * @api {delete} api/permissions/delete  – Удаление прав на действие
     * @apiVersion 1.0.0
     * @apiName delete
     * @apiGroup permissions
     *
     * @apiParam    {Number} act_perm_id               ИД права у роли
     *
     *
     *
     *
     * @apiSuccess  {boolean} result : true ? false                 Возвращает true или false
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *    {"successful":true,"message":"ok","data":"null"}
     *
     *
     *
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    let { act_perm_id } = req.query;
    let permClass = new permissions();
    if (act_perm_id) {
      permClass.act_perm_id = act_perm_id;
      let result = permClass.deleteRoleAction();
      if (!result)
        res.send(beautifyResponse(false, "Permissions Delete Error"));
      else res.send(beautifyResponse(true));
    } else {
      res.send(beautifyResponse(false, "Не заполнены поля"));
    }
  }
  async getRoleAction(req, res, next) {
    /**
     * @api {get} api/permissions/get  – Получение списка прав доступа к роли
     * @apiVersion 1.0.0
     * @apiName get
     * @apiGroup permissions
     *
     * @apiParam    {Number} role_id              ИД роли
     *
     *
     *
     *
     * @apiSuccess  {boolean} result : true ? false                 Возвращает true или false
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *    {"successful":true,"message":"ok","data":[{"action_id":2,"action_name":"setDefault","action_code":"setDefault"}],"errCode":null}
     *
     *
     *
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    let { role_id } = req.query;
    let permClass = new permissions();
    if (role_id) {
      permClass.role_id = role_id;
      let result = await permClass.getRoleAction();
      if (!result)
        res.send(beautifyResponse(false, "Permissions Delete Error"));
      else res.send(beautifyResponse(true, "ok", result));
    } else {
      res.send(beautifyResponse(false, "Не заполнены поля"));
    }
  }

  /////DEPRECATED
  async getPermissions(req, res, next) {
    /**
     * @api {get} api/permissions/getPermissions  – Получение списка прав доступа [DEPRECATED]
     * @apiVersion 1.0.0
     * @apiName getPermissions
     * @apiGroup permissions
     *
     * @apiParam    {Number} permission_id               ИД права у роли
     *
     *
     *
     *
     * @apiSuccess  {boolean} result : true ? false                 Возвращает true или false
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *    {"successful":true,"message":"ok","data":"null"}
     *
     *
     *
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    let { permission_id } = req.query;
    let permClass = new permissions();
    if (permission_id) {
      permClass.permission_id = permission_id;
      let result = await permClass.getPermission();
      if (!result)
        res.send(beautifyResponse(false, "Permissions Delete Error"));
      else res.send(beautifyResponse(true, "ok", result));
    } else {
      res.send(beautifyResponse(false, "Не заполнены поля"));
    }
  }
  async addPermission(req, res, next) {
    /**
     * @api {put} api/permissions/add  –Добавление прав модулей [DEPRECATED]
     * @apiVersion 1.0.0
     * @apiName add
     * @apiGroup permissions
     *
     * @apiParam    {Number} user_id                              ИД пользователя
     * @apiParam    {Number} module_id                           ИД модуля
     * @apiParam    {Number} action_id                          ИД действия с модуля
     *
     *
     *
     *
     * @apiSuccess  {boolean} result : true ? false                 Возвращает true или false
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *    {"successful":true,"message":"ok","data":"null"}
     *
     *
     *
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    let { user_id, module_id, action_id } = req.body;
    let permClass = new permissions();
    if (user_id && module_id && action_id) {
      permClass.user_id = user_id;
      permClass.module_id = module_id;
      permClass.action_id = action_id;
      let result = permClass.addPermission();
      if (!result) res.send(beautifyResponse(false, "Permissions add Error"));
      else res.send(beautifyResponse(true));
    } else {
      res.send(beautifyResponse(false, "Не заполнены поля"));
    }
  }
  async getRoleActionsByUser(req, res, next) {
    /**
     * @api {get} api/permissions/getRoleActionsByUser  –Получение всех прав пользователя
     * @apiVersion 1.0.0
     * @apiName getRoleActionsByUser
     * @apiGroup permissions
     *
     * @apiParam    {Number} user_id                              ИД пользователя (берётся из сессии)
     *
     *
     *
     *
     * @apiSuccess  {boolean} result : true ? false                 Возвращает true или false
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *    {"successful":true,"message":"ok","data":"null"}
     *
     *
     *
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */

    let permClass = new permissions();
    permClass.user_id = req.user.user_id;
    let result = await permClass.getUserActions();
    let groupModule = coreFunc.groupBy("module_code");
    let role_actions = groupModule(result, "action_code");
    res.locals.result = beautifyResponse(true, "ok", role_actions);
    next();
  }

  async deletePermission(req, res, next) {
    /**
     * @api {delete} api/permissions/deletePermission  – Удаление прав на действие [DEPRECATED]
     * @apiVersion 1.0.0
     * @apiName deletePermission
     * @apiGroup permissions
     *
     * @apiParam    {Number} permission_id               ИД права
     *
     *
     *
     *
     * @apiSuccess  {boolean} result : true ? false                 Возвращает true или false
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *    {"successful":true,"message":"ok","data":"null"}
     *
     *
     *
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    let { permission_id } = req.query;
    let permClass = new permissions();
    if (permission_id) {
      permClass.permission_id = permission_id;
      let result = permClass.deletePermission();
      if (!result)
        res.send(beautifyResponse(false, "Permissions Delete Error"));
      else res.send(beautifyResponse(true));
    } else {
      res.send(beautifyResponse(false, "Не заполнены поля"));
    }
  }
}
module.exports = permissionsController;
