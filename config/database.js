import pg from "pg";
import env from "dotenv";

env.config();
const getDbHandle = function () {
  const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
  return db;
};

const sqlQuery = async function (sqlString, aryValues) {
  const db = getDbHandle();
  await db.connect();
  const result = db.query(sqlString, aryValues);
  return result;
};

export default sqlQuery;
