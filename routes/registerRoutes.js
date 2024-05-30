import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default router;
