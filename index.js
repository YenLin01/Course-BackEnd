const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dotenv = require("dotenv");
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
dotenv.config();
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", authRoute);
app.use(
  "/api/course",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

mongoose
  .connect("mongodb://127.0.0.1:27017/mernDB")
  .then(console.log("connect to mernDB"))
  .catch((e) => {
    console.log(e);
  });

app.listen(8080, () => {
  console.log("connect to back_end server");
});