const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Blog = require("./blog");

const reviewSchema = Schema({
  content: { type: String, required: true },
  user: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  blog: { type: mongoose.Schema.ObjectId, required: true, ref: "Blog" },
  reactions: {
    laugh: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  },
});

// Calculate Review Count and update in Blog
reviewSchema.statics.calculateReviews = async function (blogId) {
  const reviewCount = await this.find({ blog: blogId }).count();
  await Blog.findByIdAndUpdate(blogId, { reviewCount: reviewCount });
};

reviewSchema.post("save", function () {
  // this point to current review
  this.constructor.calculateReviews(this.blog);
});

// Neither findByIdAndUpdate norfindByIdAndDelete have access to document middleware.
// They only get access to query middleware
// Inside this hook, this will point to the current query, not the current review.
// Therefore, to access the review, we’ll need to execute the query
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.doc = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.doc.constructor.calculateReviews(this.doc.blog);
});

module.exports = mongoose.model("Review", reviewSchema);
