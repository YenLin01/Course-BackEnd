const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  next();
});

router.post("/register", async (req, res) => {
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { username, password, role, email } = req.body;

  const emailExist = await User.findOne({ email: email });
  if (emailExist) return res.status(500).send("email 已被使用");

  let newUser = new User({ username, password, role, email });
  try {
    let saveUser = await newUser.save();
    return res.send({
      msg: "成功儲存使用者",
      saveUser,
    });
  } catch (e) {
    console.log(e);
  }
});
router.get("/testAPI", (req, res) => {
  res.send("successfully connect to auth route");
});

router.post("/login", async (req, res) => {
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) return res.status(400).send("找不到使用者");

  foundUser.compare(req.body.password, (err, isMatch) => {
    if (err) return res.status(400).send(err);

    if (isMatch) {
      const tokenObj = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObj, process.env.PASSPORT_SECRET);
      return res.status(200).send({
        message: "成功登入",
        user: foundUser,
        token: "JWT " + token,
      });
    } else {
      return res.status(500).send("密碼錯誤");
    }
  });
});

module.exports = router;
