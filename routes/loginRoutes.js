import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import "../config/passport.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Show Login Page
router.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "login.html"));
});

// Show Login Success Page
router.get("/success", (req, res) => {
  res.send(
    '<p>You have successfully logged in!<p> <a href="http://localhost:3001/login/protected">Go to the protected Page now</a>'
  );
});

// Show Login Failed Page
router.get("/failed", (req, res) => {
  res.send("Login failed!");
});

// Show Login PROTECTED Page
router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const html =
      "<h1>Congrats!</h1> <h3> This page is protected and only accessible with a valid JWT-Token.</h3> <h5>You are: " +
      req.user.userid +
      " - " +
      req.user.username +
      "</h5>";
    res.send(html);
  }
);

export default router;
