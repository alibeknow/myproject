const beautifyResponse = require("../middleWare").beautifyResponse;
const signatureClass = require("../models/signature");
const formClass = require("../models/forms");
const axios = require("axios");
const envConfig = require("../config/system.env")(process.env.NODE_ENV);

class signatureController {
  async GetSignatures(req, res, next) {
    /**
     * @api {get} api/signatures/getSignatures  – поиск файлов по ИД элемента модуля
     * @apiVersion 1.0.0
     * @apiName getSignatures
     * @apiGroup signatures
     *
     * @apiParam    {int} entity_id                               ID элемента сущности
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *
     *     Пока нет примера
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    let { entity_id } = req.query;
    let userId;

    let result;
    let arrMap = [];

    let objForm = {};
    let dictionary = new signatureClass();
    let form = new formClass();
    try {
      if (req.user.roles != "rUser") {
        objForm = await form.GetSearchFormBy(
          `form_id=${entity_id}`,
          20,
          1,
          "send_date desc"
        );
        if (objForm) userId = objForm[0].user_id;
      } else {
        userId = req.user.user_id;
      }
      console.log(objForm);
      result = await dictionary.GetSignatures(
        userId,
        req.moduleCode,
        entity_id
      );
      result.map(async sign => {
        sign.sign_info = JSON.parse(sign.sign_info);
        await arrMap.push(sign);
      });
      console.log(arrMap);
      res.send(beautifyResponse(true, "ok", arrMap));
    } catch (error) {
      res.send(beautifyResponse(false, error.message));
      return 0;
    }
  }
  async extractInfoFromXml(req, res, next) {
    /**
     * @api {post} api/signatures/ExtractinfoFromXml  – Получение сертификата из подписи ЭЦП и запись его в БД
     * @apiVersion 1.0.0
     * @apiName ExtractinfoFromXml
     * @apiGroup signatures
     *
     * @apiParam    {string} signedDoc                      подписанный документ base64
     * @apiParam    {int} entity_id                           ID подписывающей формы
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    const { signedDoc, entity_id } = req.body;
    let bin = req.user.user_name;
    let result;
    let dictionary = new signatureClass();
    axios
      .post(`${envConfig.signHost}/eds/getUserInfo`, signedDoc, {
        headers: { "Content-Type": "text/plain" }
      })
      .then(async function(response) {
        if (response.data.success) {
          if (
            req.user.user_name == "160540022169" &&
            (process.env.NODE_ENV == "development" ||
              process.env.NODE_ENV == "testing")
          ) {
            let dateobj = new Date();
            let senddate;
            let jsonstring = JSON.stringify(response.data);
            senddate = dateobj.toISOString();
            try {
              result = await dictionary.AddSign(
                req.user.user_id,
                signedDoc,
                entity_id,
                jsonstring,
                senddate,
                req.moduleCode
              );
              if (!result.result) {
                res.send(
                  beautifyResponse(
                    false,
                    "Ошибка записи информации ЭЦП в систему БД",
                    "",
                    "ESIGNEXCEPTION"
                  )
                );
                return (result = res.send(
                  beautifyResponse(true, "всё прошло")
                ));
              }
            } catch (error) {
              res.send(beautifyResponse(false, error.message));
              return 0;
            }
            res.send(beautifyResponse(true, "ok", response.data.data));
            return 0;
          }
          if (response.data.data.iin != bin) {
            return res.send(
              beautifyResponse(
                false,
                `БИН Вашей организации ${req.user.user_name} и БИН ЭЦП ${response.data.data.iin} не совпадают`
              )
            );
          }
        } else {
          res.send(beautifyResponse(false, response.message));
          return 0;
        }
      })
      .catch(function(error) {
        res.send(beautifyResponse(false, error.message));
        return 0;
      });
  }
  async AddSign(req, res, next) {
    res.send("ok");
  }
}
module.exports = signatureController;
