const { user } = require("../models/");

const router = require("express").Router();
const userNote = require("../models/").userNote;
const noteValidation = require("../validation").noteValidation;

router.use((req, res, next) => {
  console.log("applying noteRoute");
  next();
});

router.post("/", async (req, res) => {
  let { error } = noteValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { title, content, month, date } = req.body;
  let newNote = new userNote({
    title,
    content,
    author: req.user._id,
    TodoDate: { month, date },
  });

  try {
    let saveNote = await newNote.save();
    return res.send({ message: "筆記儲存成功", saveNote });
  } catch (e) {
    return res.status(500).send("儲存失敗");
  }
});

router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  let foundData = await userNote
    .find({ author: _id })
    .sort({ "TodoDate.month": 1, TodoDate: 1 })
    .exec();

  return res.send(foundData);
});

router.post("/delete", async (req, res) => {
  let { _id } = req.body;
  let result = await userNote.findOneAndDelete({ _id });
  res.send(result);
});

router.post("/todoToday", async (req, res) => {
  let Today = new Date();
  let month = Today.getMonth() + 1;
  let day = Today.getDate();

  let findNote = await userNote
    .find({
      "TodoDate.month": { $eq: month },
      "TodoDate.date": { $eq: day },
      author: req.user._id,
    })
    .exec();
  return res.send(findNote);
});

router.post("/expired", async (req, res) => {
  let Today = new Date();
  let month = (Today.getMonth() + 1) * 100;
  let day = Today.getDate();
  let total = month + day;
  console.log(total);
  let findNote = await userNote
    .aggregate([
      {
        $project: {
          title: 1,
          state: 1,
          author: 1,
          total: {
            $add: [{ $multiply: ["$TodoDate.month", 100] }, "$TodoDate.date"],
          },
        },
      },
      {
        $match: {
          total: { $lt: total },
          state: { $ne: "done" },
          author: { $eq: req.user._id },
        },
      },
    ])
    .exec();

  return res.send(findNote);
});

router.post("/state", async (req, res) => {
  let { data } = req.body;

  let result = userNote
    .updateMany({ _id: { $in: data } }, { state: "done" })
    .then()
    .catch((e) => {
      console.log(e);
    });
  res.send();
});

router.post("/cancelDone", async (req, res) => {
  let { data } = req.body;

  let result = userNote
    .updateMany({ _id: { $in: data } }, { state: "" })
    .then()
    .catch((e) => {
      console.log(e);
    });
  res.send();
});

module.exports = router;
