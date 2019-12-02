const bcrypt = require("bcrypt-nodejs");
const moment = require("moment");
const crypto = require("crypto");
const iv = new Buffer.alloc(16);
const algorithm = "aes-256-cbc";
const key = "3pEK_a3>|XN3^17$a?r0#[)E*a&L****";
const xmlbuilder = require("xmlbuilder");

let encrypt = text => {
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

let decrypt = text => {
  let decrypt = crypto.createDecipheriv(algorithm, key, iv);
  let s = decrypt.update(text, "base64", "utf8");

  return s + decrypt.final("utf8");
};
const queryBuilder = filter => {
  let result = [];
  let to;
  let from;
  filter.map(objFilter => {
    let [key, value] = Object.entries(objFilter);
    switch (objFilter.type) {
      case "date": //expects dd.mm.yyyy date Format
        to = objFilter.value[0]
          ? (objFilter.value[0] = moment(
              objFilter.value[0]
                .split(".")
                .reverse()
                .join("-")
            ).format("YYYY-MM-DD HH:mm:ss"))
          : objFilter.value[0];
        from = objFilter.value[1]
          ? (objFilter.value[1] = moment(
              objFilter.value[1]
                .split(".")
                .reverse()
                .join("-")
            )
              .endOf("day")
              .format("YYYY-MM-DD HH:mm:ss"))
          : objFilter.value[1];
        if (to instanceof moment && from instanceof moment)
          result.push(`send_date between *${from}* and *${to}*`);
        else return new Error("Не дата");
        break;
      case "string":
        result.push(`${key} like %${value}%`);
        break;
      case "number":
        if (value[0] > 0) result.push(`${key[0]}=${value[0]}`);
        else return new Error("Не число");
        break;

      case "select":
        result.push(`${key[0]} in (${value[0].join(",")})`);
        break;
      default:
        return new Error(`Нет такого формата фильтра ${objFilter}`);
    }
  });

  result = result.join(" and ");
  let orderby = "1 desc";
  let resb = {};
  resb.order = orderby;
  resb.queryBuilder = result;
  return resb;
};

const groupBy = key => (array, nameVal) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    if (nameVal)
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(
        obj[nameVal]
      );
    else
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

const replaceSpaces = string => {
  if (string !== undefined) return string.trim().replace(" ", "");
};

const pagination = (totalElements, pageSize = 10, currentPage = 1) => {
  let pagination = {};
  pagination.totalElements = totalElements;
  pagination.pageSize = pageSize;
  pagination.currentPage = currentPage;
  pagination.totalPages = Math.ceil(totalElements / pageSize);
  return pagination;
};
const setHash = async function(password) {
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      //password = Math.floor(Date.now() / 1000) + salt;
      bcrypt.hash(password, salt, null, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
  });
  return hashedPassword;
};
const formatDate = date => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};
const generateRandomString = length => {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};
const recordsToXml = (records, Values = null) => {
  if (!Values) {
    Values = {};
    Values.parent = "serv";
    Values.first = "accountid";
    Values.second = "servid";
    Values.third = "sum";
  }
  let xml = xmlbuilder.create("root");
  records.map(item => {
    xml
      .ele(Values.parent)
      .ele(Values.first, item.account_id)
      .up()
      .ele(Values.second, item.serv_id)
      .up()
      .ele(Values.third, item.form_sum)
      .up()
      .end({ pretty: true });
  });
  return xml.toString();
};
module.exports.recordsToXml = recordsToXml;
module.exports.generateRandomString = generateRandomString;
module.exports.groupBy = groupBy;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.queryBuilder = queryBuilder;
module.exports.pagination = pagination;
module.exports.replaceSpaces = replaceSpaces;
module.exports.setHash = setHash;
module.exports.formatDate = formatDate;
