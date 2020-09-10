const express = require("express");
const router = express.Router();
const passport = require("passport");
const validators = require("../middlewares/validators");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");

/**
 * @route POST api/auth/login
 * @description Login
 * @access Public
 */
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  authController.loginWithEmail
);

/**
 * @route POST api/auth/login/facebook
 * @description Login with facebook
 * @access Public
 */
router.post(
  "/login/facebook",
  passport.authenticate("facebook-token"),
  authController.loginWithFacebookOrGoogle
);

/**
 * @route POST api/auth/login/google
 * @description Login with google
 * @access Public
 */
router.post(
  "/login/google",
  passport.authenticate("google-token"),
  authController.loginWithFacebookOrGoogle
);

module.exports = router;
