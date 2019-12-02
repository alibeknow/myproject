const { Pool, types } = require("pg");
const connectionString = require("../config/system.env")(process.env.NODE_ENV)
  .pgDb;
const TYPE_DATESTAMP = 1082;
types.setTypeParser(TYPE_DATESTAMP, date => date);

var pool;
module.exports = {
  getPool: function() {
    if (pool) return pool;
    pool = new Pool(connectionString);
    return pool;
  }
};
