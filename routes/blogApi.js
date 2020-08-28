const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");

/**
 * @route POST api/blogs
 * @description Create a new blog
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  validators.validate([
    body("title", "Missing Title").exists().notEmpty(),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  blogController.createNewBlog
);

/**
 * @route GET api/blogs
 * @description Get blogs with pagination
 * @access Public
 */
router.get("/", blogController.getBlogs);

/**
 * @route GET api/blogs/:id
 * @description Get a single Blog
 * @access Public
 */
router.get(
  "/:id",
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  blogController.getSingleBlog
);

/**
 * @route PUT api/blogs/:id
 * @description Update a single blog
 * @access Owner required
 */
router.put(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("title", "Missing title").notEmpty(),
    body("content", "Missing content").notEmpty(),
  ]),
  blogController.updateSingleBlog
);

/**
 * @route DELETE api/blogs/:id
 * @description Delete a single blog
 * @access Owner required
 */
router.delete(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  blogController.deleteSingleBlog
);

module.exports = router;
