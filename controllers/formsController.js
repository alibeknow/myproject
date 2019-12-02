const formClass = require("../models/forms");
const beautifyResponse = require("../middleWare").beautifyResponse;
const core = require("../core/systemactions");
const emailSender = require("../models/email");
const moment = require("moment");
const userClass = require("../models/users");
const xl = require("excel4node");

class formController {
  async get(req, res, next) {
    /**
         * @api {post} api/forms/get  – Получение всех форм по пользователю
         * @apiVersion 1.0.0
         * @apiName getUserForms
         * @apiGroup forms
         *
         * @apiParam    {int} form_id                         ID FORM
         * @apiParam    {array[string]} form_type_code        Тип формы 
         * @apiParam    {date} date_from                      дата отправки  ISO FORMAT
         * @apiParam    {date} date_to                        дата отправки  ISO FORMAT
         * @apiParam    {int} suppl_id                        код поставщика
         * @apiParam    {int} statusCode                      Статус формы
         * @apiParam    {int} binsuppl                        БИН поставщика
         * @apiParam    {int} pageSize                        колличество элементов на странице
         * @apiParam    {int} currentPage                     текущая страница
         * @apiParam    {string} orderBy                      порядок полей [send_date desc]
         
         *
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
    let bin = req.user.user_name;

    let result = [];
    let response;
    let {
      form_id,
      form_type_code,
      date_from,
      date_to,
      pageSize,
      currentPage,
      orderBy,
      suppl_id,
      binsuppl,
      statusCode
    } = req.query;
    let form = new formClass(
      form_id,
      bin,
      null,
      suppl_id,
      null,
      form_type_code,
      statusCode
    );
    orderBy ? orderBy : (orderBy = "send_date desc");

    date_from
      ? (date_from = moment(
          date_from
            .split(".")
            .reverse()
            .join("-")
        ).format("YYYY-MM-DD HH:mm:ss"))
      : date_from;
    date_to
      ? (date_to = moment(
          date_to
            .split(".")
            .reverse()
            .join("-")
        )
          .endOf("day")
          .format("YYYY-MM-DD HH:mm:ss"))
      : date_to;

    if (form_id) {
      result.push(`form_id=${form_id}`);
    }
    if (statusCode) {
      let arrCleanstatusCode = statusCode.map(statusCode => `*${statusCode}*`);
      result.push(`status_code in (${arrCleanstatusCode.join(",")})`);
    }
    if (form_type_code) {
      let arrCleanType_code = form_type_code.map(type_code => `*${type_code}*`);
      result.push(`form_type_code in (${arrCleanType_code.join(",")})`);
    }

    if (date_from && date_to) {
      result.push(`send_date between *${date_from}* and *${date_to}*`);
    } else if (date_from) {
      let dateEnd = new Date(Date.now());
      dateEnd = dateEnd.toISOString();
      result.push(`send_date between *${date_from}* and *${dateEnd}*`);
    } else if (date_to) {
      let dateBegin = moment(date_to)
        .startOf("day")
        .format("YYYY-MM-DD HH:mm:ss");
      result.push(`send_date between *${dateBegin}* and *${date_to}*`);
    }

    let arCodeSuppls = [];
    if (binsuppl) {
      let newresult = [];
      let prom;
      let user = new userClass();
      newresult = binsuppl.map(async suppl => {
        user.user_name = suppl;
        arCodeSuppls = await user.getSupplyId();
        return arCodeSuppls.map(supplObj => supplObj.suppl_id).join(",");
      });
      prom = await Promise.all(newresult);
      result.push(`house_manage_id in (${prom})`);
    }
    if (suppl_id) {
      let arrSupplIds = suppl_id.map(id_suppl => id_suppl);
      result.push(`house_manage_id in (${arrSupplIds.join(",")})`);
    }
    switch (req.user.roles) {
      case "rUser":
        result.push(`fl.user_id=${req.user.user_id}`);
        result.push(`status_code NOT IN (*sMonitored*,*sDeleted*)`);
        break;
      case "rAdmin":
        result.push(`fl.form_id IS NOT NULL`);
        result.push(`status_code NOT IN (*sAtWork*)`);
        break;
      case "rManager":
        result.push(`status_code NOT IN (*sDeleted*,*sAtWork*)`);
        break;
    }
    result = result.join(" and ");
    orderBy ? orderBy : (orderBy = "send_date desc");

    result = await form.GetSearchFormBy(result, pageSize, currentPage, orderBy);

    let totalElements = result.pop();
    let pagination = core.pagination(
      totalElements.total_count,
      pageSize,
      currentPage
    );
    let resulter = {};
    resulter.array = result;
    resulter.pagination = pagination;

    if (result) {
      response = beautifyResponse(true, "ok", resulter);
    } else {
      response = beautifyResponse(
        false,
        "У данного пользователя нет ни одной формы"
      );
    }
    res.send(response);
  }
  async saveUserForm(req, res, next) {
    /**
     * @api {put} api/forms/add  – Сохранение информации по формам пользователя
     * @apiVersion 1.0.0
     * @apiName add
     * @apiGroup forms
     *
     * @apiParam    {Number} year                      год выставления платежа
     * @apiParam    {Number} month                     месяц выставления платежа
     * @apiParam    {Number} suppl_id                     Код организации
     * @apiParam    {Number} typeCode                  тип формы
     * @apiParam    {Number} statusCode                статус формы
     * @apiParam    {boolean} sign           Тип задолженности (принимает значение 0 или 1) где 0 - +, а 1 - "-"
     * @apiParam    {json} serv              Информация по сервисам json
     * [{"serv":(
     * "form_sum":10000
     * "account_id":121
     * "serv_id":1241
     *  )}]
     *
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *
     *     {"successful":true,"message":"ok","data":"5151"}, где дата - ID сохранённой формы
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    let { year, month, typeCode, statusCode, sign, serv, suppl_id } = req.body;
    let bin = req.user.user_name;

    let form = new formClass();
    if (
      !bin ||
      !year ||
      !month ||
      !typeCode ||
      !statusCode ||
      !serv ||
      !suppl_id
    ) {
      res.send(beautifyResponse(false, "Заполните все поля"));
      return 0;
    }
    form.bin = bin;
    form.month = month;
    form.typeCode = typeCode;
    form.statusCode = statusCode;
    form.sign = sign;
    form.records = serv;
    form.suppl_id = suppl_id;
    form.year = year;
    let duplicate = form.FilterRecords();

    if (duplicate.length) {
      res.send(beautifyResponse(false, "Найдены дубликаты", duplicate));
      return 0;
    }
    let xml;
    if (form.records.length >= 1) {
      xml = core.recordsToXml(form.records);
      form.records = xml;
    } else {
      res.send(beautifyResponse(false, "не заполнены поля услуги"));
    }
    let result;
    if (!xml) {
      res.send(beautifyResponse(false, "Не заполнены данные по услугам формы"));
      return 0;
    }

    result = await form.Add();

    if (result) {
      res.send(beautifyResponse(true, "ok", result));
      return 0;
    }
    res.send(beautifyResponse(false, "не удалось сохранить форму"));
  }
  async UpdateUserForm(req, res, next) {
    /**
     * @api {post} api/forms/update  – Изменение данных по формам (услуги и сумма может принимать массивы данных)
     * @apiVersion 1.0.0
     * @apiName update
     * @apiGroup forms
     *
     * @apiParam    {Number} form_id         ID формы
     * @apiParam    {Number} year            год
     * @apiParam    {Number} month           месяц
     * @apiParam    {boolean} sign           Тип задолженности (принимает значение 0 или 1) где 0 - +, а 1 - "-"
     * @apiParam    {text} comments           Комментарии менеджера
     * @apiParam    {json} serv              Информация по сервисам json [НЕ ОБЯЗАТЕЛЬНЫЙ ПАРАМЕТР]
     * [{"serv":(
     * "serv_data_id":7,
     * "form_sum":10000,
     * "serv_id":121,
     * "account_id":1241
     *  )}]
     *
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *
     *     {"successful":true,"message":"okey","data":"null"}
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    let response;
    let result;
    let {
      serv,
      form_id,
      year,
      month,
      sign,
      comments,
      suppl_id,
      typeCode,
      signatures
    } = req.body;
    let form = new formClass(
      form_id,
      req.user.user_name,
      year,
      suppl_id,
      month,
      typeCode,
      null,
      sign,
      serv,
      signatures,
      comments
    );
    form.formId = form_id;

    let xml = "";
    if (form.records) {
      xml = core.recordsToXml(form.records);
      form.records = xml;
    }
    result = await form.Update();
    response = beautifyResponse(true, "ok", result);
    res.send(response);
  }
  async UpdateStatusAtWork(req, res, next) {
    /**
     * @api {post} api/forms/UpdateStatusAtWork  –Изменение статуса на Черновик
     * @apiVersion 1.0.0
     * @apiName UpdateStatusAtWork
     * @apiGroup forms
     *     * @apiParam    {Number} form_id                      ИД формы
     * */
    let result;
    let form = new formClass();
    let { form_id } = req.body;
    let statusCode = "sAtWork";
    form.statusCode = statusCode;
    form.formId = form_id;
    result = await form.Update();
    res.locals.result = beautifyResponse(true);
    next();
  }
  async UpdateStatusAccepted(req, res, next) {
    /**
     * @api {post} api/forms/UpdateStatusAccepted  –Изменение статуса на Принята
     * @apiVersion 1.0.0
     * @apiName UpdateStatusAccepted
     * @apiGroup forms
     * @apiParam    {Number} form_id                      ИД формы
     * */
    let result;
    let form = new formClass();
    let { form_id } = req.body;
    let email = new emailSender();
    let statusCode = "sAccepted";
    form.statusCode = statusCode;
    form.formId = form_id;
    result = await form.Update();
    email.message = `Форма с № ${form_id} изменила статус на <b>${statusCode}</b> для более подробной информации перейдите по ссылке <a href='http://10.40.240.101:5000/'>Личный кабинет Алсеко</a>`;
    email.reciever = req.user.email;
    let error = email.Send();
    if (error) next(error);

    res.locals.result = beautifyResponse(true);
    next();
  }
  async UpdateStatusSended(req, res, next) {
    /**
     * @api {post} api/forms/UpdateStatusSended  –Изменение статуса на Отправлена
     * @apiVersion 1.0.0
     * @apiName UpdateStatusSended
     * @apiGroup forms
     * @apiParam    {Number} form_id                      ИД формы
     * */
    let result;
    let form = new formClass();
    let { form_id } = req.body;
    let dateobj = new Date();
    let statusCode = "sSended";
    form.senddate = dateobj.toISOString();
    form.statusCode = statusCode;
    form.formId = form_id;
    result = await form.Update();
    let email = new emailSender();
    email.message = `Форма с № ${form_id} изменила статус на <b>${statusCode}</b> для более подробной информации перейдите по ссылке <a href='http://10.40.240.101:5000/'>Личный кабинет Алсеко</a>`;
    email.reciever = req.user.email;
    let error = email.Send();
    if (error) next(error);

    res.locals.result = beautifyResponse(true);
    next();
  }
  async UpdateStatusRejected(req, res, next) {
    /**
     * @api {post} api/forms/UpdateStatusRejected  –Изменение статуса на отклонена
     * @apiVersion 1.0.0
     * @apiName UpdateStatusRejected
     * @apiGroup forms
     * @apiParam    {Number} form_id                      ИД формы
     * @apiParam    {string} comments                     Комментарии
     * */
    let result;
    let form = new formClass();
    let { form_id, comments } = req.body;
    let statusCode = "sRejected";
    form.statusCode = statusCode;
    form.formId = form_id;
    form.comments = comments;
    result = await form.Update();
    let email = new emailSender();
    email.message = `Форма с № ${form_id} изменила статус на <b>${statusCode}</b> для более подробной информации перейдите по ссылке <a href='http://10.40.240.101:5000/'>Личный кабинет Алсеко</a>`;
    email.reciever = req.user.email;
    let error = email.Send();
    if (error) next(error);

    res.locals.result = beautifyResponse(true);
    next();
  }
  async UpdateStatusDeleted(req, res, next) {
    /**
     * @api {post} api/forms/UpdateStatusDeleted  –Изменение статуса на Удалена
     * @apiVersion 1.0.0
     * @apiName UpdateStatusDeleted
     * @apiGroup forms
     * @apiParam    {Number} form_id                      ИД формы
     * */
    let result;
    let form = new formClass();
    let { form_id } = req.body;
    let statusCode = "sDeleted";
    form.formId = form_id;
    form.statusCode = statusCode;
    result = await form.Update();
    let email = new emailSender();
    email.message = `Форма с № ${form_id} изменила статус на <b>${statusCode}</b> для более подробной информации перейдите по ссылке <a href='http://10.40.240.101:5000/'>Личный кабинет Алсеко</a>`;
    email.reciever = req.user.email;
    let error = email.Send();
    if (error) next(error);
    res.locals.result = beautifyResponse(true);
    next();
  }
  async getUserFormDetail(req, res, next) {
    /**
     * @api {get} api/forms/getDetail  – Получение детальной информации по форме
     * @apiVersion 1.0.0
     * @apiName getDetail
     * @apiGroup forms
     *
     * @apiParam    {Number} form_id                      ИД формы
     *
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *
     *     {"successful":true,"message":"ok","data":[{"serv_data_id":5,"sign":0,"form_id":62,"account_id":100262382,"serv_id":11,"form_sum":1111}]}
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */

    const { form_id } = req.query;
    let response;
    let result;
    let form = new formClass();
    if (form_id) {
      form.formId = form_id;

      result = await form.GetDetail();
      response = beautifyResponse(true, "ok", result);
      res.send(response);
    } else {
      res.send(beautifyResponse(false, "не заполнена FormId"));
    }
  }
  async getCurrentPeriod(req, res, next) {
    /**
     * @api {post} api/forms/getCurrentPeriod  –Возвращает текущий период платежей
     * @apiVersion 1.0.0
     * @apiName getCurrentPeriod
     * @apiGroup forms
     *
     *
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *
     *      {
     *    "successful": true,
     *    "message": "ok",
     *     "data": {
     *         "year": 2019,
     *         "month": 8
     *       }
     *     }
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    let form = new formClass();

    let result = await form.GetCurrentPeriod();
    res.send(beautifyResponse(true, "ok", result));
  }
  async approve(req, res, next) {
    /**
     * @api {post} api/forms/approve  – контроля и выполнения пачки пачки записей в форме
     * @apiVersion 1.0.0
     * @apiName approve
     * @apiGroup forms
     *
     * @apiParam    {Number} form_id                      ИД формы
     * @apiParam    {Number} month                        месяц
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *
     *      {
     *    "successful": true,
     *    "message": "ok",
     *     "data": {
     *         "year": 2019,
     *         "month": 8
     *       }
     *     }
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */
    const { form_id, month } = req.body;

    if (!form_id || !month) {
      return res.send(beautifyResponse(false, "Не заполнено поля"));
    }
    let form = new formClass(form_id);
    let result = await form.GetCurrentPeriod();
    if (month != result.month) {
      let comments = "Ошибка. Неверный месяц. Заявка автоматически отклонена";
      form.statusCode = "sRejected";
      form.comments = comments;
      await form.Update();
      return res.send(
        beautifyResponse(
          false,
          "Ошибка. Неверный месяц. Заявка автоматически отклонена",
          null,
          "WRONGMONTH"
        )
      );
    }

    result = await form.Approve();
    if (!result.result) {
      return res.send(beautifyResponse(false, "", "", "DATAEXCEPTION"));
    }
    let comments = "";
    form.comments = comments;
    await form.Update();
    return res.send(beautifyResponse(true));
  }
  async GetSupplIdsAuthor(req, res, next) {
    /**
     * @api {get} api/forms/getSupplIdsAuthors  –Получение всех кодов поставщиков у которых есть формы
     * @apiVersion 1.0.0
     * @apiName getSupplIdsAuthors
     * @apiGroup forms
     *
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
    let result;
    let roleCode = req.user.roles;
    let form = new formClass();
    if (roleCode == "rManager" || roleCode == "rAdmin") {
      result = await form.GetFormSuppls();
    } else result = await form.getUserSuppls(req.user.user_name);
    res.send(beautifyResponse(true, "ok", result));
  }
  async GetAuthors(req, res, next) {
    /**
     * @api {get} api/forms/GetAuthors  –Получение всех авторов форм
     * @apiVersion 1.0.0
     * @apiName GetAuthors
     * @apiGroup forms
     *
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

    let result;
    let dictionary = new formClass();
    result = await dictionary.GetAuthors();
    res.send(beautifyResponse(true, "ok", result));
  }
  async downloadForm(req, res, next) {
    /**
     * @api {get} api/forms/downloadForm  –Скачивание формы в формате excel
     * @apiVersion 1.0.0
     * @apiName downloadForm
     * @apiGroup forms
     * @apiParam    {Number} form_id                      ИД формы
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK

     *     Пока нет примера
     *
     *
     * @apiError  {boolean} successful:false {String} message
     * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
     *     HTTP/1.1 500 Internal Server Error
     */

    let { form_id } = req.query;
    console.log(req.query);
    let resultDetail;
    let form = new formClass();
    let wb = new xl.Workbook();
    form.formId = form_id;
    let formResult = await form.GetSearchFormBy(
      `form_id=${form_id}`,
      20,
      1,
      "send_date desc"
    );
    resultDetail = await form.GetDetail();
    let ws = wb.addWorksheet(
      `форма ${formResult[0].form_type_name}№ ${form_id}`
    );

    // Set value of cell C1 to a formula styled with paramaters of style

    formResult = formResult[0];

    ws.cell(1, 1).string("Месяц корректировки");
    ws.cell(1, 2).string(`месяц: ${formResult.month}  год:${formResult.year}`);
    ws.cell(2, 1).string("Статус");
    ws.cell(2, 2).string(formResult.status_name);
    ws.cell(3, 1).string("Код организации");
    ws.cell(3, 2).string(formResult.house_manage_id.toString());
    console.log(formResult.sign);
    if (formResult.sign != null) {
      formResult.sign ? (formResult.sign = "+") : (formResult.sign = "-");
      ws.cell(4, 1).string("Со знаком");
      ws.cell(4, 2).string(formResult.sign);
    }
    ws.cell(6, 2).string("Записи");
    ws.cell(7, 1).string("Лицевой счёт");
    ws.cell(7, 2).string("Услуга");
    ws.cell(7, 3).string("Сумма");

    let row = 8;
    await resultDetail.map(async rower => {
      ws.cell(row, 1).string(rower.account_id.toString());
      ws.cell(row, 2).string(rower.serv_id.toString());
      ws.cell(row, 3).string(rower.form_sum.toString());
      row++;
    });

    wb.write("ExcelFile.xlsx", res);
  }
}
module.exports = formController;
