const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const globalMsgSchema = Schema(
  {
    user: { type: Schema.ObjectId, required: true, ref: "User" },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

const GlobalMessage = mongoose.model("GlobalMessage", globalMsgSchema);
module.exports = GlobalMessage;
