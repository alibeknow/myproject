const userClass = require("../models/users");
const core = require("../core/systemactions");
const emailSender = require("../models/email");
const beautifyResponse = require("../middleWare").beautifyResponse;
const envConfig = require("../config/system.env")(process.env.NODE_ENV);
const xmlbuilder = require("xmlbuilder");
module.exports = function(passport) {
  class userController {
    //////USER ACTIONS
    // Register
    /* Handle Registration POST */
    async signup(req, res, next) {
      /**
       * @api {put} api/users/signup  – Регистрация пользователя
       * @apiVersion 1.0.0
       * @apiName signup
       * @apiGroup users
       *
       * @apiParam    {Number} login                              Логин поставщика
       * @apiParam    {Number} password                           пароль
       * @apiParam    {Number} password2                          повторение пароля
       * @apiParam    {Number} email                              Email поставщика
       * @apiParam    {Number} bin                                Бин поставщика
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
      let { email, bin, password2, login, password } = req.body;
      let errors = [];
      if (!login || !email || !password || !password2 || !bin) {
        errors.push("Должны быть заполнены все поля");
      }

      if (password != password2) {
        errors.push("Пароли не совпадают");
      }
      if (password.length < 6) {
        errors.push("Пароль должен быть больше 6 символов");
      }
      if (errors.length > 0) {
        return next(errors);
      }

      passport.authenticate("local-signup", function(err, user, info) {
        if (err) {
          return next(err);
        }
        if (info) {
          res.locals.result = beautifyResponse(false, info);
          return next();
        }
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          }

          let Email = new emailSender(user.hash);
          Email.message = `<b>Уважаемый пользователь</b>, Для подтверждения регистрации перейдите по ссылке или скопируйте
          ссылку в браузер, <b><a href='${envConfig.host}/verify?secret=${user.hash}'>Сссылка</a></b>. Если письмо пришло к Вам по ошибке проигнорируйте письмо`;
          Email.themeMessage = "Подтверждение регистрации";

          if (process.env.NODE_ENV == "production") Email.reciever = email;

          let errorr2 = Email.Send();

          if (errorr2) {
            return next(errorr2);
          }
          res.locals.result = beautifyResponse(true);
          return next();
        });
      })(req, res, next);
    }
    async checkHash(req, res, next) {
      /**
       * @api {post} api/users/checkHash  –  Проверка действительности хэша(ссылки)
       * @apiVersion 1.0.0
       * @apiName checkHash
       * @apiGroup users
       *
       * @apiParam    {string} secretToken                                                    Хэш сумма
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
       * {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let { secretToken } = req.body;
      let User = new userClass();
      let myres;
      myres = await User.searchBy(
        `hash=*${secretToken}*`,
        1,
        2,
        "user_id desc"
      );
      if (myres.length == 1) {
        res.locals.result = beautifyResponse(
          false,
          "Данная ссылка больше не действительна"
        );
      } else {
        res.locals.result = beautifyResponse(true);
      }
      next();
    }
    async verify(req, res, next) {
      /**
       * @api {post} api/users/verify  –  Верификация зарегистрированного пользователя
       * @apiVersion 1.0.0
       * @apiName verify
       * @apiGroup users
       *
       * @apiParam    {string} secretToken                                                    Хэш сумма
       * @apiParam    {string} password[Не обязательный параметр]                             Пароль(передаются в случае сброса\восстановления пароля)
       * @apiParam    {string} password2[Не обязательный параметр]                            Повторение пароля(передаются в случае сброса\восстановления пароля)
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
       * {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let { secretToken, password } = req.body;

      // Find account with matching secret token
      let User = new userClass();
      let myres;
      User.hash = secretToken;
      if (!secretToken) {
        res.locals.result = beautifyResponse(
          "false",
          "не заполнено поле secretToken"
        );
        next();
      }
      myres = await User.searchBy(
        `hash=*${secretToken}*`,
        1,
        2,
        "user_id desc"
      );
      if (myres.length == 1) {
        res.locals.result = beautifyResponse(
          false,
          "Данная ссылка больше не действительна"
        );
        next();
      }

      if (myres && password) {
        let secretHash = await core.setHash(password);
        User.user_name = myres[0].user_name;
        User.password = secretHash;
        User.active = 1;
        User.hash = "";
        myres = await User.Update();
      } else {
        myres = await User.Confirm();
      }
      res.locals.result = beautifyResponse(myres.result);
      next();
    }
    async login(req, res, next) {
      /**
       * @api {post} api/users/login  – Аутентификация
       * @apiVersion 1.0.0
       * @apiName login
       * @apiGroup users
       *
       * @apiParam    {Number} login                              Логин поставщика
       * @apiParam    {Number} password                           пароль
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
       * {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let { login, password } = req.body;
      let err = [];
      login = core.replaceSpaces(login);
      if (!login || !password) {
        res
          .status(200)
          .send(beautifyResponse(false, "Заполните логин и пароль"));
        return 0;
      }
      if (password.length < 6) {
        res
          .status(200)
          .send(
            beautifyResponse(false, "Пароль должен быть больше 6 символов")
          );
        return 0;
      }

      passport.authenticate("local-login", function(err, user, info) {
        if (err) {
          next(err);
        } else if (info) {
          return res.status(200).send(beautifyResponse(false, info));
        }
        req.login(user, err => {
          if (err) {
            next(err);
          }
          res.send(beautifyResponse(true, "ok", { role_code: user.roles }));
          res.end();
        });
      })(req, res, next);
    }
    // Logout
    logout(req, res) {
      /**
       * @api {post} api/users/logout  – Обнуление сессии
       * @apiVersion 1.0.0
       * @apiName logout
       * @apiGroup users
       *
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
       * {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      req.logout(); // [1]
      req.session.destroy(() => {
        let response = beautifyResponse(true);
        res.send(response);
      }); // [2]
    }
    async sendhash(req, res, next) {
      /**
       * @api {post} api/users/sendHash  – отправка хэша для восстановления пароля
       * @apiVersion 1.0.0
       * @apiName sendHash
       * @apiGroup users
       *
       * @apiParam    {Number} login                              Логин поставщика
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
       * {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let { login } = req.body;
      let secretToken;
      let result;

      secretToken = await core.setHash(login);
      let User = new userClass();
      User.user_name = login;
      User.hash = secretToken;

      result = await User.GetByLogin();
      if (!result) res.send(beautifyResponse(false, "Нет такого пользователя"));

      await User.Update();

      let Email = new emailSender(secretToken);
      Email.message = `
      <b>Уважаемый пользователь</b>, Вы получили это письмо потому что, запросили восстановление пароля. Для подтверждения перейдите по ссылке или скопируйте
       ссылку в браузер, <b><a href='${envConfig.host}/verify?secret=${secretToken}&changepassword=true'>Сссылка</a></b>. Если Вы не 
       запрашивали восстановление пароля проигнорируйте данное письмо`;
      if (process.env.NODE_ENV == "production") Email.reciever = result.email;

      let error = Email.Send();
      if (error) next(error);
      res.locals.result = beautifyResponse(true);
      next();
    }
    async getUserInfo(req, res, next) {
      /**
       * @api {get} api/users/get  –  Получение информации о пользователе
       * @apiVersion 1.0.0
       * @apiName get
       * @apiGroup users
       *
       *
       *
       * @apiSuccess  {boolean} result : true ? false                 Возвращает true или false
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *  { user_id: 2,
       *             last_name: 'fdsfdsfsdfsd',
       *       first_name: null,
       *       middle_name: '',
       *       mobile_number: '' }
       *
       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":true,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let User = new userClass();
      User.user_name = req.user.user_name;

      User = await User.Get();

      let response;
      if (User) {
        User.bin = req.user.user_name;
        response = beautifyResponse(true, "ok", User);
      } else {
        response = beautifyResponse(false);
      }
      res.locals.result = response;
      next();
    }
    async saveUserInfo(req, res, next) {
      /**
       * @api {post} api/users/update  – Сохранение информации пользователя
       * @apiVersion 1.0.0
       * @apiName update
       * @apiGroup users
       *
       * @apiParam    {Number} last_name                      фамилия
       * @apiParam    {Number} first_name                     имя
       * @apiParam    {Number} middle_name                    отчество
       * @apiParam    {Number} mobile_number                  Номер мобильного номера
       *
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *
       *      {"successful":true,"message":"ok","data":"null"}
       *
       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let { last_name, first_name, middle_name, mobile_number } = req.body;
      let user = new userClass(
        req.user.user_name,
        null,
        null,
        null,
        last_name,
        first_name,
        middle_name,
        mobile_number
      );

      let result = await user.Update();
      res.locals.result = beautifyResponse(result.result);
      next();
    }
    async addUser(req, res, next) {
      /**
       * @api {post} api/users/addUser  – Создание поставщика
       * @apiVersion 1.0.0
       * @apiName addUser
       * @apiGroup users
       *
       * @apiParam    {string} login                         логин пользователя
       * @apiParam    {int} role_id                       ИД роли (1-поставщик,2-менеджер Алсеко); пользователя
       * @apiParam    {string} password                      Пароль пользователя
       * @apiParam    {string} password2                     Пароль повторение
       * @apiParam    {string} email                         email пользователя
       *
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *
       *    {"successful":true,"message":"ok","data":"{'id':181}"}
       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let { login, role_id, password, passowrd2, email } = req.body;
      let user = new userClass();
      if (!role_id) role_id = 1;
      if (!login || !role_id || !password || !passowrd2 || !email) {
        res.locals.result = beautifyResponse(false, "Заполните все поля");
        next();
      }

      let result = await user.Add();
      res.locals.result = beautifyResponse(true, "ok", result);
      next();
    }
    async getRoles(req, res, next) {
      /**
       * @api {get} api/users/getRoles  – Получение всех ролей
       * @apiVersion 1.0.0
       * @apiName getRoles
       * @apiGroup users
       *
       *
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *
       *    {"successful":true,"message":"ok","data":"[{'id':181,"name":'admin'}]"}
       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let user = new userClass();

      let result = await user.getRoles();
      res.locals.result = beautifyResponse(true, "ok", result);
      next();
    }
    async getServiceProvider(req, res, next) {
      /**
       * @api {get} api/users/getServiceProvider  предоставляемые услуги данной организацией
       * @apiVersion 1.0.0
       * @apiName getServiceProvider
       * @apiGroup users
       *
       * @apiParam    {number} suppl_id               Код организации
       *
       * @apiSuccess  {Number} serv_id                   Код услуги
       * @apiSuccess  {varchar} serv_name                Наименование услуги
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *
       *                  {
       *                  "successful": true,
       *                   "message": "ok",
       *                  "data": [
       *                       {
       *                           "serv_id": 80,
       *                           "serv_name": "ТО общедом. приборов учета  теплоэнер."
       *                       },
       *                       {
       *                           "serv_id": 82,
       *                           "serv_name": "Уборка подъездов"
       *                       },
       *                       {
       *                           "serv_id": 128,
       *                           "serv_name": "Домофон"
       *                       },
       *                       {
       *                           "serv_id": 188,
       *                           "serv_name": "Эксплуатационные услуги"
       *                       },
       *                       {
       *                           "serv_id": 190,
       *                           "serv_name": "Видеонаблюдение"
       *                       },
       *                       {
       *                           "serv_id": 238,
       *                           "serv_name": "Долг за электроэнергию"
       *                       }
       *                   ]
       *               }
       *
       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let { suppl_id } = req.query;
      let user = new userClass();
      let result;
      user.supplId = suppl_id;

      result = await user.getServices();

      let response;
      if (result[0]) {
        response = beautifyResponse(true, "ok", result);
        res.locals.result = response;
        next();
      } else {
        response = beautifyResponse(
          false,
          "Нет данных по данному коду организации"
        );
        res.locals.result = response;
        next();
      }
    }
    async checkAccountSuppl(req, res, next) {
      /**
       * @api {post} api/users/checkAccountSuppl  – Проверка лицевого счёта и кода поставщика
       * @apiVersion 1.0.0
       * @apiName checkAccountSuppl
       * @apiGroup users
       *
       *
       * @apiParam    {Number} suppl_id                        код организации
       * @apiParam    {Number} serv_id                        код услуги
       * @apiParam    {Number} accountId                      Номер л/счета
       *
       * @apiSuccess  {boolean} result                        false\true
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *
       *      {"successful":true,"message":"ok","data":"null"}
       *
       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      const { accountId, serv_id, suppl_id } = req.body;
      let user = new userClass();
      let result;
      if (
        accountId > 2147483647 ||
        accountId < 0 ||
        Number.isInteger(accountId)
      ) {
        res.locals.result = beautifyResponse(
          false,
          "Число не integer должно иметь диапазон -2147483648 and 2147483647"
        );
        next();
      }

      user.services = serv_id;
      user.supplId = suppl_id;
      result = await user.checkAccount(accountId);

      let message;
      switch (result.error_code) {
        case 1:
          message = "Нет лицевого счёта в БД";
          break;
        case 2:
          message = "Данной услуги нет у лицевого счёта";
          break;
        case 3:
          message = "Данный БИН не предоставляет выбранную услугу у поставщика";
          break;
        default:
          message = "";
          break;
      }
      if (message != "") {
        res.locals.result = beautifyResponse(false, message);
        next();
      }
      let response;
      if (result.result) {
        response = beautifyResponse(result.result, "ok", result.data);
      } else {
        response = beautifyResponse(result.result, "Нет данных");
      }
      res.locals.result = response;
      next();
    }
    async getUserSuppl(req, res, next) {
      /**
       * @api {get} api/users/getUserSuppl  – Получение кодов организации
       * @apiVersion 1.0.0
       * @apiName getUserSuppl
       * @apiGroup users
       *
       * @apiParam    {string} bin                         Бин организации
       *
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *
       *    {"successful":true,"message":"ok","data":"{'suppl':181}"}
       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let { bin } = req.query;

      if (!bin) {
        bin = req.user.user_name;
      }
      let user = new userClass();
      user.user_name = bin;

      let result = await user.getSupplyId();
      console.log(result.length);
      if (result.length > 0) {
        res.locals.result = beautifyResponse(true, "ok", result);
      } else {
        res.locals.result = beautifyResponse(false, "Нет данных");
      }
      next();
    }
    async crossLogin(req, res, next) {
      /**
       * @api {post} api/users/crossLogin  – Расшифровка данных с сервера
       * @apiVersion 1.0.0
       * @apiName crossLogin
       * @apiGroup users
       *
       * @apiParam    {string} cryptData                         Шифрованная строка алгоритм ("aes-256-cbc")
       * @apiParam    {datetime} dateRequest                         Дата запроса ISO FORMAT
       *
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *
       *    {"successful":true,"message":"ok","data":"{'suppl':181}"}
       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      passport.authenticate("cross-login", function(err, user, info) {
        if (err) {
          next(err);
        } else if (info) {
          return res.status(200).send(beautifyResponse(false, info));
        }
        req.login(user, err => {
          if (err) {
            next(err);
          }
          let url = envConfig.host + "/redirect?secret=" + user;
          return res.send(beautifyResponse(true, "ok", url));
        });
      })(req, res, next);
    }
    async getSupplAddresses(req, res, next) {
      /**
       * @api {get} api/users/getSupplAddresses  – получение списка адресов домов поставщика
       * @apiVersion 1.0.0
       * @apiName getSupplAddresses
       * @apiGroup users
       *
       * @apiParam    {string} suppl_id 
       * 
       *
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *
       *    {
    "successful": true,
    "message": "hello",
[{"street_id":996,"street_name":"ул. Толе би","house_id":"273/10"},{"street_id":996,"street_name":"ул. Толе би","house_id":"273/11"},{"street_id":996,"street_name":"ул. Толе би","house_id":"273/5"},{"street_id":996,"street_name":"ул. Толе би","house_id":"273/8"},{"street_id":996,"street_name":"ул. Толе би","house_id":"273/9"}]
       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let user = new userClass();
      user.supplId = req.query.suppl_id;

      let result = await user.getSupplAddresses();
      res.send(beautifyResponse(true, "hello", result));
      res.locals.result = result;
      next();
    }
    async getSupplAccounts(req, res, next) {
      /**
       * @api {post} api/users/getSupplAccounts  – получение списка абонентов по дому и улице
       * @apiVersion 1.0.0
       * @apiName getSupplAccounts
       * @apiGroup users
       *
       * @apiParam    {object} data  массив объектов полученных в методе addresses [{streetid,houseid}]
       * @apiParam    {int} suppl_id  Код поставщика
       * @apiParam    {int} pageSize                        колличество элементов на странице
       * @apiParam    {int} currentPage                     текущая страница
       * @apiParam    {string} orderBy                      порядок полей [address desc]
       *
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *[
    {
        "account_id": 7411880,
        "account_name": "ТОКТЫБАЕВ ДАНИЯР ЕРИКОВИЧ",
        "address": "ул. Толе би",
        "house_id": "273/5",
        "flat_number": "90",
        "iin": "861116300577",
        "group_name": "1204 ТОО \"Excluzive Home\""
    },
    {
        "account_id": 7411898,
        "account_name": "ИСМАГУЛОВА ШОЛПАН БЕРДЫБЕКОВНА",
        "address": "ул. Толе би",
        "house_id": "273/5",
        "flat_number": "9",
        "iin": "600812400343",
        "group_name": "1204 ТОО \"Excluzive Home\""
    },
    {
        "account_id": 7411901,
        "account_name": "МАНАРБЕКОВА АЙМАН САТАНОВНА",
        "address": "ул. Толе би",
        "house_id": "273/5",
        "flat_number": "80",
        "iin": "660828450199",
        "group_name": "1204 ТОО \"Excluzive Home\""
    },
    {
        "account_id": 7411910,
        "account_name": "ОРЫНБАЕВ АСКАР СУШЕВИЧ",
        "address": "ул. Толе би",
        "house_id": "273/5",
        "flat_number": "146",
        "iin": "850712301500",
        "group_name": "1204 ТОО \"Excluzive Home\""
    },
  ]

       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let user = new userClass();
      let { data, suppl_id, pageSize, currentPage, orderBy } = req.body;

      let xml = xmlbuilder.create("root");
      if (data) {
        data.map(item => {
          xml
            .ele("house")
            .ele("houseid", item.house_id)
            .up()
            .ele("streetid", item.street_id)
            .up()
            .end({ pretty: true });
        });
        user.supplId = suppl_id;
        orderBy ? orderBy : (orderBy = "street_id desc,house_id");
        let result = await user.getSupplAccounts(
          xml.toString(),
          currentPage,
          pageSize,
          orderBy
        );

        let totalElements = result.pop();
        let pagination = core.pagination(
          totalElements.total_count,
          pageSize,
          currentPage
        );
        let resulter = {};
        resulter.array = result;
        resulter.pagination = pagination;

        res.locals.result = beautifyResponse(true, "ok", resulter);
      } else
        res.locals.result = beautifyResponse(
          false,
          "Переменная дата не объявлена"
        );
      next();
    }
    async getUserAccounts(req, res, next) {
      /**
       * @api {get} api/users/getUserAccounts  – Получение списка лицевых по логину
       * @apiVersion 1.0.0
       * @apiName getUserAccounts
       * @apiGroup users
       *
       * @apiParam    {string} login
       *
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *
       *    {"successful":true,"message":"ok","data":[
    {
        "account_id": 935808,
        "account_name": "СМАГИНА ЛАРИСА ЯКОВЛЕВНА",
        "address": "ул. Абдуллиных",
        "house_id": "16",
        "flat_number": "7",
        "iin": "500522400227",
        "group_name": "801 КСК \" ТАЛГАРСКАЯ-17 \""
    },
    {
        "account_id": 9472142,
        "account_name": "КРИВОШЕЕВ ПЁТР НИКОЛАЕВИЧ",
        "address": "ул. Димитрова",
        "house_id": "30А",
        "flat_number": "0",
        "iin": "570507302248",
        "group_name": "4026 ИП \"БАКИЕВА А.М.\""
    },
    {
        "account_id": 9472827,
        "account_name": "ОНИЩЕНКО АЛЕКСАНДР ВЕННАДЬЕВИЧ",
        "address": "ул. Димитрова",
        "house_id": "30А",
        "flat_number": "0",
        "iin": "831129300215",
        "group_name": "4026 ИП \"БАКИЕВА А.М.\""
    },
    {
        "account_id": 9472827,
        "account_name": "ОНИЩЕНКО АЛЕКСАНДР ВЕННАДЬЕВИЧ",
        "address": "ул. Димитрова",
        "house_id": "30А",
        "flat_number": "0",
        "iin": "831129300215",
        "group_name": "4026 ИП \"БАКИЕВА А.М.\""
    }
]}
       *
       * @apiError  {boolean} successful:false {String} message
       * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
       *     HTTP/1.1 500 Internal Server Error
       */
      let user = new userClass();
      user.user_name = req.user;
      let result = await user.getUserAccounts();
      res.locals.result = result;
      next();
    }
    async getPersonalInfo(req, res, next) {
      /**
       * @api {get} api/users/getPersonalInfo  – иНФОРМАЦИЯ ПО ЛОГИНУ
       * @apiVersion 1.0.0
       * @apiName getPersonalInfo
       * @apiGroup users
       *
       * @apiParam    {string} login
       *
       *
       * @apiSuccessExample Success-Response:
       *     HTTP/1.1 200 OK
       *
       *    {"successful":true,"message":"ok","data":[
    {
            "FirstName": "Онищенко",
            "LastName": "Александр",
            "MiddleName": "+77071133400",
            "Email": "skmk@list.ru"
        }
    */
      let user = new userClass();
      user.user_name = req.user;
      let result = await user.getPersonalInfo();
      res.send(beautifyResponse(true, "ok", result));
    }
  }

  let UserController = new userController();
  return UserController;
};
