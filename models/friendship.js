const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = require("./user");

const friendshipSchema = Schema({
  from: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  to: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  status: {
    type: String,
    enum: ["requesting", "accepted", "decline", "removed", "cancel"],
  },
});

friendshipSchema.statics.calculateFriendCount = async function (userId) {
  const friendCount = await this.find({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  }).count();
  await User.findByIdAndUpdate(userId, { friendCount: friendCount });
};

friendshipSchema.post("save", function () {
  this.constructor.calculateFriendCount(this.from);
  this.constructor.calculateFriendCount(this.to);
});

friendshipSchema.pre(/^findOneAnd/, async function (next) {
  this.doc = await this.findOne();
  next();
});

friendshipSchema.post(/^findOneAnd/, async function (next) {
  await this.doc.constructor.calculateFriendCount(this.doc.from);
  await this.doc.constructor.calculateFriendCount(this.doc.to);
});

module.exports = mongoose.model("Friendship", friendshipSchema);
