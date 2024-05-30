import jwt from "jsonwebtoken";
import sqlQuery from "../config/database.js";
import env from "dotenv";

env.config();

const createJWT = function (payload) {
  const expiresIn = "1h";
  const signedToken = jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: expiresIn,
  });
  // console.log(token);
  return { signedToken, expiresIn };
};

const saveJwtToDb = async function (userid, token) {
  const doesOldTokenExist = await sqlQuery(
    "SELECT * FROM jwt WHERE userid = $1",
    [userid]
  );
  // Update jwt Table for the userid if it exists
  if (doesOldTokenExist.rowCount > 0) {
    const result = await sqlQuery(
      "UPDATE jwt SET activetoken = $2  WHERE userid = $1",
      [userid, token]
    );
    return result;
  }

  // Insert token in jwt-table if no prior JWT exists
  const result = await sqlQuery(
    "INSERT INTO jwt (userid, activetoken) VALUES ($1, $2)",
    [userid, token]
  );
  return result;
};

export { createJWT, saveJwtToDb };
