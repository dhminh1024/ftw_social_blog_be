const utilsHelper = require("../helpers/utils.helper");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const authController = {};

authController.loginWithEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log({ email, password });
    const user = await User.findOne({ email });
    if (!user) return next(new Error("Invalid Credentials"));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new Error("Wrong Password"));

    accessToken = await user.generateToken();
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      { user, accessToken },
      null,
      "Login successful"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = authController;
