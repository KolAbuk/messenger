const { Schema, model } = require("mongoose");

const schema = new Schema({
  from: { type: String, required: true }, //user id
  to: { type: String, required: true }, //chat id
  time: { type: Number, required: true },
  type: { type: String, required: true },
  body: { type: String, required: true },
});

module.exports = model("messages", schema);
