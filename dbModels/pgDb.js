class pgDb {
  constructor() {
    this.pool = require("./dbconn").getPool();
  }
  query(sql) {
    this.pool.connect().then(client => {
      return client
        .query(sql, [1]) // your query string here
        .then(res => {
          client.release();
          console.log(res.rows[0]); // your callback here
        })
        .catch(e => {
          client.release();
          console.log(e.stack); // your callback here
        });
    });
    // connection using created pool
    this.pool.connect(async function(err, client, done) {
      if (err) return err;
      let res = await client.query(sql);

      done();
    });
  }
}

module.exports = pgDb;
/*
const pool = require("../configs/default")(process.env.NODE_ENV).pool;

function addOzo(id, json) {
  return new Promise((resolve, reject) => {
    pool.query(
      `select * from public.fn_get_refs_storage_data_by_codename('${id},${name}')`,
      async (err, results) => {
        if (err) {
          err = await convert.getDBError(req.locale.region, err);
          reject(err);
        } else {
          Object.keys(results.rows[0]["ref_storage_data"]).forEach(
            (key, index) => {
              json["ozo_" + key] = results.rows[0]["ref_storage_data"][key];
            }
          );
          resolve(json);
        }
      }
    );
  });
}
*/
