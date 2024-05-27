import express, { request } from "express";
import bodyParser from "body-parser";
import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy } from "passport-local";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

import env from "dotenv";

import loginRouter from "./routes/loginRoutes.js";
import registerRouter from "./routes/registerRoutes.js";
import sqlQuery from "./config/database.js";

env.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/login", loginRouter);
app.use("/register", registerRouter);

// Use Local Passport Strategy to verify credentials
passport.use(
  new Strategy(async (username, password, cb) => {
    console.log(username);
    try {
      const resultdb = await sqlQuery(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      console.log(resultdb.rows[0]);
      if (resultdb.rows.length > 0) {
        const user = resultdb.rows[0];
        // console.log(password, user.hashedpassword);
        bcrypt.compare(password, user.hashedpassword, (err, result) => {
          if (err) {
            console.error(err, "Error comparing passwords", err);
            return cb(err);
          } else {
            if (result) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        cb(null, false);
      }
    } catch (error) {
      cb(error);
    }
  })
);

app.listen(port, () => {
  console.log("Login-Page running on port ", port);
});
