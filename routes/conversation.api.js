const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const userController = require("../controllers/user.controller");
// const validators = require("../middlewares/validators");
// const { body, param } = require("express-validator");

/**
 * @route GET api/conversations
 * @description Get the list of conversations
 * @access Login required
 */
router.get(
  "/",
  authMiddleware.loginRequired,
  userController.getConversationList
);

module.exports = router;
