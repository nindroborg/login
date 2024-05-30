import bcrypt from "bcrypt";
import sqlQuery from "./database.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import env from "dotenv";

env.config();

// Use Local Passport Strategy to verify credentials
passport.use(
  new LocalStrategy(async (username, password, cb) => {
    console.log(username);
    try {
      const getuser = await sqlQuery(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      console.log(getuser.rows[0]);
      if (getuser.rows.length > 0) {
        const user = getuser.rows[0];
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

// Use JWT Passport Strategy with options for issuing JWT Token
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ["HS256"],
};

passport.use(
  new JwtStrategy(options, async function (jwt_payload, done) {
    try {
      console.log(jwt_payload.sub);
      const result = await sqlQuery("SELECT * FROM users WHERE userid = $1", [
        jwt_payload.sub,
      ]);
      console.log(result.rows[0]);
      if (result.rowCount > 0 && result.rows[0].userid) {
        const user = {
          userid: result.rows[0].userid,
          username: result.rows[0].username,
        };
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);
