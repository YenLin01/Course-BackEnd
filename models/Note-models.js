const { date, boolean } = require("joi");
const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    require: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createDate: {
    type: Date,
    default: Date.now,
  },

  TodoDate: {
    month: { type: Number, require: true, min: 1, max: 12 },
    date: { type: Number, require: true, min: 1, max: 31 },
  },
  state: {
    type: String,
    enum: ["done", ""],
  },
});

module.exports = mongoose.model("note", NoteSchema);
