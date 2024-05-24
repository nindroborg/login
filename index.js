import express, { request } from "express";
import bodyParser from "body-parser";
import passport from "passport";
import { Strategy } from "passport-local";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";

env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
await db.connect();

const passwordMinLength = 4;
const saltRounds = 10;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Show Login Page
app.get("/login", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Show Login Success Page
app.get("/login/success", (req, res) => {
  res.send("You have successfully logged in!");
});

// Show Login Failed Page
app.get("/login/failed", (req, res) => {
  res.send("Login failed!");
});

// Show Register Page
app.get("/register", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Show Register Success Page
app.get("/register/success", async (req, res) => {
  console.log("You've been successfully registered. Wait for granting roles.");
  res.send("You've been successfully registered. Wait for granting roles.");
});

// Show Register Failed Page
app.get("/register/failed", async (req, res) => {
  console.log("Sign Up failed!");
  res.send("Sign Up failed!");
});

// Submit Register Page
app.post("/register", async (req, res) => {
  console.log(req.body.email, req.body.password);
  const username = req.body.email;
  const password = req.body.password;

  try {
    if (password.length < passwordMinLength || !username) {
      res.redirect("/register/failed");
    }
    const doesUserAlreadyExist = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (doesUserAlreadyExist.rows.length > 0) {
      res.redirect("/register/failed");
    } else {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const result = await db.query(
        "INSERT INTO users (username, hashedpassword) VALUES ($1, $2)",
        [username, hashedPassword]
      );
      console.log(result);
      res.redirect("/register/success");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/register/failed");
  }
});

// Submit Login Page
app.post("/login", (req, res, next) => {
  passport.authenticate("local", async (error, user, info) => {
    if (error) {
      console.log(error);
    }
    if (!user) {
      res.redirect("/login/failed");
    }
    if (user) {
      res.redirect("/login/success");
    }
  })(req, res, next);
});

// Use Local Passport Strategy to verify credentials
passport.use(
  new Strategy(async (username, password, cb) => {
    console.log(username);
    try {
      const resultdb = await db.query(
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
