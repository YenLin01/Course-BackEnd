const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  next();
});

// GET all course
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["email", "username"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//let student use course id to enroll course
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    if (!courseFound) return res.status(500).send("註冊失敗");
    courseFound.students.push(req.user._id);
    await courseFound.save();
    res.send("註冊完成");
  } catch (e) {
    return res.send(e);
  }
});

// use course name to find course
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  let courseFound = await Course.find({ title: name })
    .populate("instructor", ["username", "email"])
    .exec();
  console.log(courseFound);
  return res.send(courseFound);
});

// use student id to find course that student enroll in
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let courseFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(courseFound);
});

// use instructor id to find course
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  let coursesFound = await Course.find({ instructor: _instructor_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

// use course id to find course
router.get("/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["email", "usename"])
      .exec();
    return res.status(200).send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 透過講師尋找課程
router.get("/instructor/:_id", async (req, res) => {
  let { _id } = req.params;
  let foundData = await Course.find({ instructor: _id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.status(200).send(foundData);
});

// 使用學生去找到註冊過的課程
router.get("/student/:_id", async (req, res) => {
  let { _id } = req.params;
  let foundData = await Course.find({ student: _id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.status(200).send(foundData);
});

// add new course
router.post("/", async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res
      .status(400)
      .send("只有講師才發布新課程,請更換成講師帳號以便發送新課程...");
  }
  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title: title,
      description: description,
      price: price,
      instructor: req.user._id,
    });
    let saveCourse = await newCourse.save();
    return res.status(200).send({ msg: "new course has been save" });
  } catch (e) {
    res.status(500).send("無法創造課程");
  }
});

// update course
router.patch("/:_id", async (req, res) => {
  // verify data is Compliance with validation
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let { _id } = req.params;
  //comform course is exist
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      res.status(400).send("course doesn't exist ");
    }
    // user must to be course's instructor
    if (courseFound.instructor.equals(req.user._id)) {
      let updateCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({
        message: "course has been update",
        updateCourse,
      });
    } else {
      return res.status(403).send("只有此課程講師才能編輯課程");
    }
  } catch (e) {
    return res.status(500);
  }
});

router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;

  try {
    let courseFound = await Course.findOne({ _id }).exec();
    if (!courseFound) {
      res.status(400).send("course doesn't exist, can't delete course ");
    }
    // user must to be course's instructor
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.status(200).send("course has been delete");
    } else {
      return res.status(403).send("只有此課程講師才能刪除課程");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
