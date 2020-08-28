const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");
const reviewController = require("../controllers/reviewController");

/**
 * @route POST api/reviews/blogs/:id
 * @description Create a new review to a blog
 * @access Login required
 */
router.post(
  "/blogs/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  reviewController.createNewReview
);

/**
 * @route GET api/reviews/blogs/:id?page=1&limit=10
 * @description Get reviews of a blog with pagination
 * @access Public
 */
router.get(
  "/blogs/:id",
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  reviewController.getReviewsOfBlog
);

/**
 * @route PUT api/reviews/:id
 * @description Update a single review
 * @access Owner required
 */
router.put(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("content", "Missing content").notEmpty(),
  ]),
  reviewController.updateSingleReview
);

/**
 * @route DELETE api/reviews/:id
 * @description Delete a single review
 * @access Owner required
 */
router.delete(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  reviewController.deleteSingleReview
);

module.exports = router;
