const { Schema, model } = require("mongoose");

const schema = new Schema({
  name: { type: String },
  users: [{ type: String, required: true }],
  //messages: [{ type: String, required: true }],
});

module.exports = model("Chats", schema);
