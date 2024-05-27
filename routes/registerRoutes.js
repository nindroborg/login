import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  createHashedPassword,
  saveHashedPasswordToDb,
  getUserFromDb,
} from "../lib/passwordUtils.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const passwordMinLength = 4;

// Show Register Page
router.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "register.html"));
});

// Show Register Success Page
router.get("/success", async (req, res) => {
  console.log("You've been successfully registered. Wait for granting roles.");
  res.send("You've been successfully registered. Wait for granting roles.");
});

// Show Register Failed Page
router.get("/failed", async (req, res) => {
  console.log("Sign Up failed!");
  res.send("Sign Up failed!");
});

// Submit Register Page
router.post("/", async (req, res) => {
  console.log(req.body.email, req.body.password);
  const username = req.body.email;
  const password = req.body.password;

  try {
    if (password.length < passwordMinLength || !username) {
      res.redirect("/register/failed");
    }
    const doesUserAlreadyExist = await getUserFromDb(username);
    if (doesUserAlreadyExist.rows.length > 0) {
      res.redirect("/register/failed");
    } else {
      const hashedPassword = await createHashedPassword(password);
      await saveHashedPasswordToDb(username, hashedPassword);
      // console.log(result);
      res.redirect("/register/success");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/register/failed");
  }
});

export default router;
