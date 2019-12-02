const perm = require("./models/permissions");

const rowToJSON = function rowToJSON(tediousRow) {
  return new Promise(resolve => {
    let result = {};
    tediousRow.forEach(element => {
      result[element.metadata.colName] = element.value;
    });
    resolve(result);
  });
};
const rowsToJSON = function rowsToJSON(tediousRows) {
  return new Promise(resolve => {
    let result = [];
    tediousRows.forEach(rowElement => {
      let row = {};
      rowElement.forEach(element => {
        row[element.metadata.colName] = element.value;
      });
      result.push(row);
    });
    resolve(result);
  });
};
const beautifyResponse = function(
  successful,
  message = null,
  data = null,
  errCode = null
) {
  if (message == null) {
    message = "ok";
  }
  if (successful) {
    !message ? (message = "ok") : message;
    return {
      successful: successful,
      message: message,
      data: data,
      errCode: errCode
    };
  } else {
    if (message)
      return {
        successful: successful,
        message: message,
        data: data,
        errCode: errCode
      };
    else
      return {
        successful: successful,
        message: "Нет данных",
        data: data,
        errCode: errCode
      };
  }
};
let middleWare = fn => async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .send({ successful: false, message: "Not authenticated" });
  }
  let url = req.url;
  let arrayAction = url.split("/");
  let request;
  let action = arrayAction[arrayAction.length - 1];
  if (action.indexOf("?") > 0)
    action = action.substring(0, action.indexOf("?"));

  req.files
    ? (request = req.files.fieldname + " " + req.files.originalname)
    : req.body
    ? (request = req.body)
    : (request = req.param
        ? (request = req.query)
        : (request = "wihout param"));
  req.moduleCode = "mdl" + arrayAction[arrayAction.length - 2];
  req.actionCode = action;
  if (req.user) {
    try {
      let permissions = new perm();
      permissions.user_id = req.user.user_id;

      let canDo = await permissions.roleActionExists(
        req.moduleCode,
        req.actionCode
      );
      if (!canDo.result) {
        return res
          .status(403)
          .send({ successful: false, message: "Doesn't Have Permissions" });
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  Promise.resolve(fn(req, res, next)).catch(next);
};

let cors = function(res, req, next) {
  res.append(
    "Access-Control-Allow-Origin",
    !req.headers.origin ? "*" : req.headers.origin
  );
  res.append("Access-Control-Allow-Headers", "Authorization");
  res.append("Access-Control-Allow-Credentials", true);
  res.append(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, HEAD, OPTIONS"
  );
  res.append("Access-Control-Allow-Headers", "origin, content-type, accept");

  next(); // http://expressjs.com/guide.html#passing-route control
};

module.exports.middleWare = middleWare;
module.exports.cors = cors;
module.exports.rowToJSON = rowToJSON;
module.exports.rowsToJSON = rowsToJSON;
module.exports.beautifyResponse = beautifyResponse;
