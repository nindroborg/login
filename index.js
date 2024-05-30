import express, { request } from "express";
import bodyParser from "body-parser";
import passport from "passport";

import path from "path";
import { fileURLToPath } from "url";

import loginRouter from "./routes/loginRoutes.js";
import registerRouter from "./routes/registerRoutes.js";
import env from "dotenv";

env.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middleware
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/login", loginRouter);
app.use("/register", registerRouter);

app.listen(port, () => {
  console.log("Login-Page running on port ", port);
});
