const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passport = require("passport");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    minLength: 1,
    maxLength: 50,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    enum: ["student", "instructor"],
    require: true,
    default: "student",
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

// method
UserSchema.methods.isStudent = function () {
  return this.role == "student";
};

UserSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

UserSchema.methods.compare = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

UserSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  } else {
    next();
  }
});

module.exports = mongoose.model("User", UserSchema);
