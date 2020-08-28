const utilsHelper = require("../helpers/utils.helper");
const Blog = require("../models/blog");
const blogController = {};

blogController.createNewBlog = async (req, res, next) => {
  try {
    const userId = req.userId;
    console.log(userId);
    const { title, content } = req.body;

    const blog = await Blog.create({
      title: title,
      content: content,
      author: userId,
    });

    return utilsHelper.sendResponse(
      res,
      200,
      true,
      { blog },
      null,
      "Create new blog successful"
    );
  } catch (error) {
    next(error);
  }
};

blogController.getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);
    const offset = limit * (page - 1);

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    return utilsHelper.sendResponse(
      res,
      200,
      true,
      { blogs, totalPages },
      null,
      null
    );
  } catch (error) {
    next(error);
  }
};

blogController.getSingleBlog = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const blog = await Blog.findById(req.params.id);
    console.log(blog);
    if (!blog) return next(new Error("Blog not found"));
    return utilsHelper.sendResponse(res, 200, true, blog, null, null);
  } catch (error) {
    next(error);
  }
};

blogController.updateSingleBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.userId },
      { title: title, content: content },
      { new: true }
    );
    if (!blog) return next(new Error("Blog not found or User not authorized"));

    return utilsHelper.sendResponse(res, 200, true, blog, null, null);
  } catch (error) {
    next(error);
  }
};

blogController.deleteSingleBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.userId },
      { isDeleted: true },
      { new: true }
    );
    if (!blog) return next(new Error("Blog not found or User not authorized"));
    return utilsHelper.sendResponse(res, 204, true, null, null, null);
  } catch (error) {
    next(error);
  }
};

module.exports = blogController;
