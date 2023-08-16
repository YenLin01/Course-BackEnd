const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dotenv = require("dotenv");
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const noteRoute = require("./routes").userNote;
dotenv.config();
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");
const path = require("path");
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", authRoute);
app.use(
  "/api/course",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);
app.use(
  "/api/note",
  passport.authenticate("jwt", { session: false }),
  noteRoute
);

app.get("/", (req, res) => {
  res.redirect("https://courseweb-0w0l.onrender.com/");
});

mongoose
  .connect(process.env.MONGODB_CONNECTION)
  .then(console.log("connect to mernDB"))
  .catch((e) => {
    console.log(e);
  });

app.listen(port, () => {
  console.log("connect to back_end server");
});
