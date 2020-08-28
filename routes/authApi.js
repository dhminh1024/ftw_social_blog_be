const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validators = require("../middlewares/validators");
const { body } = require("express-validator");

/**
 * @route POST api/auth/login
 * @description Login user / Returning JWT Token
 * @access Public
 */
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid Email").exists().isEmail(),
    body("password", "Invalid Password").exists(),
  ]),
  authController.loginWithEmail
);

module.exports = router;
