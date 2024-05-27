import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import bodyParser from "body-parser";
import { createJWT, saveJwtToDb } from "../lib/passwordUtils.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Show Login Page
router.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "login.html"));
});

// Show Login Success Page
router.get("/success", (req, res) => {
  res.send("You have successfully logged in!");
});

// Show Login Failed Page
router.get("/failed", (req, res) => {
  res.send("Login failed!");
});

// Submit Login Page
router.post("/", (req, res, next) => {
  passport.authenticate("local", async (error, user, info) => {
    if (error) {
      next(error);
      res.redirect("login/failed");
    }
    if (!user) {
      res.redirect("login/failed");
    }
    if (user) {
      try {
        const userbody = { userid: user.userid, username: user.username };
        const token = createJWT({ user: userbody });
        await saveJwtToDb(user.userid, token);
      } catch (error) {
        console.log(error);
        return next(error);
      }
      res.redirect("/login/success");
    }
  })(req, res, next);
});

export default router;
