const fileClass = require('../models/files');
const formClass = require('../models/forms');
const beautifyResponse = require('../middleWare').beautifyResponse;
const mime = require('mime');

class fileController {
    async getUserFiles(req, res, next) {
        /**
         * @api {get} api/files/getUserFiles  –  Получение данных о документах название и ид
         * @apiVersion 1.0.0
         * @apiName getUserFiles
         * @apiGroup files
         *
         *
         *
         * @apiSuccess  {number} attach_id                  id файла
         * @apiSuccess  {string} attach_file_name                    название файла
         * @apiSuccess  {boolean} result : true ? false  Возвращает true или false
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *			{
         *				"successful": true,
         *				"message": "ok",
         *				"data": [
         *					{
         *						"attach_id": "8764752",
         *						"attach_file_name": "103982_1_20190715.jpg"
         *					}
         *				]
         *			}
         *
         * @apiError  {boolean} successful:false {String} message
         * @apiErrorExample Error-Response: {"successful":true,"message":"Some error","data":"null"}
         *     HTTP/1.1 500 Internal Server Error
         */
        let bin = req.user.user_name;
        let file = new fileClass();
        let response;

        response = await file.getUserSupplDocs(bin);

        if (response.length > 0) {
            response = beautifyResponse(true, 'ok', response);
        } else {
            response = beautifyResponse(false);
        }
        res.send(response);
    }

    async getFileById(req, res, next) {
        /**
         * @api {get} api/files/getFileById  –  Получение файла по Id
         * @apiVersion 1.0.0
         * @apiName getFileById
         * @apiGroup files
         *
         * @apiParam    {number} attach_id               ID файла
         *
         *
         * @apiSuccess  {varbinary} file                  Файл
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *      {
         *           "successful": true,
         *           "message": "ok",
         *           "data": {
         *                   "docs": {
         *                   "attach_file_name": "103982_1_20190715.jpg",
         *                   "attach_file_name": "103982_1_201907152.jpg"
         *                         }}}
         *
         * @apiError  {boolean} successful:false {String} message
         * @apiErrorExample Error-Response: {"successful":true,"message":"Some error","data":"null"}
         *     HTTP/1.1 500 Internal Server Error
         */
        let { attach_id, attach_file_name } = req.query;
        let response;

        let file = new fileClass();

        response = await file.GetById(attach_id);

        if (response) {
            let nameArray = attach_file_name.toString();
            nameArray = nameArray.split('.');
            let fileExt = nameArray[nameArray.length - 1];
            fileExt = mime.getType(fileExt);
            res.append('Content-Type', fileExt);
            response = Buffer.from(response.attach_file, 'binary');
            res.write(response, 'binary');
            res.end(null, 'binary');
        }
    }
    async addFile(req, res, next) {
        /**
         * @api {put} api/files/add  –  Загрузка файлов в систему
         * @apiVersion 1.0.0
         * @apiName addFile
         * @apiGroup files
         *
         * @apiParam    {varbinary} file_body              файл
         * @apiParam    {id} entity_id               ID Сущности к которой прикладывается файл
         *
         * @apiSuccess  {json} file         {"successful":true,"message":"ok","data":"null"}
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *    {"successful":true,"message":"Some error","data":"null"}
         *
         * @apiError  {boolean} successful:false {String} message
         * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
         *     HTTP/1.1 500 Internal Server Error
         */

        let { file_body, entity_id } = req.body;
        let response;
        let dateobj = new Date();
        let createDate;
        createDate = dateobj.toISOString();
        let file = new fileClass();

        file.author_id = req.user.user_id;
        file.fileBody = file_body;
        file.date_create = createDate;
        file.module_code = req.moduleCode;

        req.files.map(async function(fileElement) {
            file.fileName = fileElement.originalname;
            let ext = fileElement.originalname.split('.');
            file.fileExt = ext[ext.length - 1];

            file.fileBody = new Buffer.from(fileElement.buffer);
            response = await file.Add(entity_id);
            if (!response.result) {
                next(new Error("File doesn't Saved"));
            }
            res.send(beautifyResponse(true, null, response));
        });
    }

    async getById(req, res, next) {
        /**
         * @api {get} api/files/get  –  Загрузка файлов в систему
         * @apiVersion 1.0.0
         * @apiName get
         * @apiGroup files
         *
         * @apiParam    {varbinary} file_id              ID_файлa
         * @apiSuccess  {json} file         {"successful":true,"message":"ok","data":"null"}
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *    {"successful":true,"message":"Some error","data":"null"}
         *
         * @apiError  {boolean} successful:false {String} message
         * @apiErrorExample Error-Response: {"successful":false,"message":"Some error","data":"null"}
         *     HTTP/1.1 500 Internal Server Error
         */

        let { file_id } = req.query;
        let file = new fileClass(file_id);
        let response;
        response = await file.GetOwn();

        if (response) {
            let nameArray = response.file_name.toString();
            nameArray = nameArray.split('.');
            let fileExt = nameArray[nameArray.length - 1];
            fileExt = mime.getType(fileExt);
            res.append('Content-Type', fileExt);
            response = Buffer.from(response.file_body, 'binary');
            res.write(response, 'binary');
            res.end(null, 'binary');
        } else {
            res.send(beautifyResponse(false, 'could not find file with id ' + file_id, response));
        }
    }
    async getFiles(req, res, next) {
        /**
         * @api {get} api/files/getFiles  – поиск файлов по ИД элемента модуля
         * @apiVersion 1.0.0
         * @apiName getFiles
         * @apiGroup files
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

        let userId = req.user.user_id;
        let result;
        let objForm;
        let form = new formClass();
        let file = new fileClass();
        if (req.user.roles != 'rUser') {
            file.author_id = userId;
            objForm = await form.GetSearchFormBy(`form_id=${entity_id}`, 20, 1, 'send_date desc');
            if (objForm) userId = objForm[0].user_id;
        }
        file.author_id = userId;
        result = await file.GetFiles(entity_id, req.moduleCode);
        res.send(beautifyResponse(true, null, result));
    }
    async deleteFile(req, res, next) {
        /**
         * @api {delete} api/files/delete  – удаление файла
         * @apiVersion 1.0.0
         * @apiName delete
         * @apiGroup files
         *
         * @apiParam    {int} file_id                               ID элемента
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
        let { file_id } = req.query;
        let file = new fileClass(file_id);
        let result;
        result = await file.Delete();
        console.log(result);
        res.send(beautifyResponse(true, null, result));
    }
}
module.exports = fileController;
