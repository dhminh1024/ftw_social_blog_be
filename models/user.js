const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friendCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
});

userSchema.plugin(require("./plugins/isDeletedFalse"));

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};
// userSchema.pre(/^find/, function (next) {
//   if (this._conditions["isDeleted"] === undefined)
//     this._conditions["isDeleted"] = false;
//   next();
// });

// userSchema.virtual("firstname").get(function () {
//   return this.name.split(" ")[0];
// });
// .get(() => this.name.substr(0, this.name.indexOf(" ")));
// userSchema
//   .virtual("lastname")
//   .get(() => this.name.substr(this.name.indexOf(" ") + 1));

const User = mongoose.model("User", userSchema);
module.exports = User;
