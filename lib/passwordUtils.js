import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sqlQuery from "../config/database.js";
import env from "dotenv";

env.config();

const saltRounds = 10;

const createHashedPassword = function (plainTextPw) {
  return bcrypt.hash(plainTextPw, saltRounds);
};

const createJWT = function (objUser) {
  const token = jwt.sign(objUser, process.env.JWT_SECRET);
  return token;
};

const saveJwtToDb = async function (userid, token) {
  const result = await sqlQuery(
    "INSERT INTO jwt (userid, activeToken) VALUES ($1, $2)",
    [userid, token]
  );
  return result;
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

export {
  createHashedPassword,
  createJWT,
  saveJwtToDb,
  saveHashedPasswordToDb,
  getUserFromDb,
};
