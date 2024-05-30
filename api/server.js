import express, { request } from "express";
import bodyParser from "body-parser";
import passport from "passport";

import path from "path";
import { fileURLToPath } from "url";

import {
  createHashedPassword,
  saveHashedPasswordToDb,
  getUserFromDb,
} from "../lib/passwordUtils.js";
import { createJWT, saveJwtToDb } from "../lib/jwtUtils.js";
import "../config/passport.js";

import env from "dotenv";

env.config();

const passwordMinLength = 4;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4001;

// Middleware
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Submit Register Page
app.post("/register", async (req, res) => {
  console.log(req.body.email, req.body.password);
  const username = req.body.email;
  const password = req.body.password;

  try {
    // Test credentials: password length, valid email address
    if (
      password.length < passwordMinLength ||
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(username)
    ) {
      return res.json({
        success: false,
        msg: "Your credentials doesn't fulfill our criteria!",
      });
    }
    const doesUserAlreadyExist = await getUserFromDb(username);
    if (doesUserAlreadyExist.rows.length > 0) {
      return res.json({
        success: false,
        msg: "Account already exists",
      });
    } else {
      const hashedPassword = await createHashedPassword(password);
      await saveHashedPasswordToDb(username, hashedPassword);
      // console.log(result);
      return res.status(201).json({
        success: true,
        msg: "New account created.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      msg: "Ooops! Something went wrong on the server!",
    });
  }
});

// Submit Login Page
app.post("/login", (req, res, next) => {
  passport.authenticate("local", async (error, user, info) => {
    if (error) {
      next(error);
      return res.json({
        success: false,
        msg: error.message,
      });
    }
    if (user) {
      try {
        // create JWT and save to Database
        const payload = {
          sub: user.userid,
          username: user.username,
          iat: Date.now(),
        };
        const { signedToken, expiresIn } = createJWT(payload);
        console.log(signedToken, expiresIn);
        await saveJwtToDb(user.userid, signedToken);
        const JwtToken = "Bearer " + signedToken;

        return res.json({
          success: true,
          userid: user.userid,
          username: user.username,
          token: JwtToken,
          expiresIn: expiresIn,
        });
      } catch (error) {
        console.log(error);
        return res.json({
          success: false,
          msg: error.message,
        });
      }
    } else {
      res.json({
        success: false,
        msg: "You are not authorized to view this resource",
      });
    }
  })(req, res, next);
});

app.listen(port, () => {
  console.log("Auth-Server running on port ", port);
});
