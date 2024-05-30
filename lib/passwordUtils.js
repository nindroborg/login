import bcrypt from "bcrypt";
import sqlQuery from "../config/database.js";
import env from "dotenv";

env.config();

const saltRounds = 10;

const createHashedPassword = function (plainTextPw) {
  return bcrypt.hash(plainTextPw, saltRounds);
};

const saveHashedPasswordToDb = async function (username, hashedPassword) {
  await sqlQuery(
    "INSERT INTO users (username, hashedpassword) VALUES ($1, $2)",
    [username, hashedPassword]
  );
};

const getUserFromDb = async function (username) {
  const result = await sqlQuery("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result;
};

export { createHashedPassword, saveHashedPasswordToDb, getUserFromDb };
