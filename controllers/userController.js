const utilsHelper = require("../helpers/utils.helper");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Friendship = require("../models/friendship");
const userController = {};

userController.register = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return next(new Error("User already exists"));

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    user = await User.create({
      name,
      email,
      password,
    });
    const accessToken = user.generateToken();

    return utilsHelper.sendResponse(
      res,
      200,
      true,
      { user, accessToken },
      null,
      "Register successful"
    );
  } catch (error) {
    next(error);
  }
};

userController.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      { user },
      null,
      "Get current user successful"
    );
  } catch (error) {
    next(error);
  }
};

userController.sendFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // From
    const targetId = req.params.id; // To
    let friendship = await Friendship.findOne({ from: userId, to: targetId });
    if (friendship) {
      switch (friendship.status) {
        case "requesting":
          return next(new Error("The request has been sent"));
          break;

        default:
          break;
      }
    }

    const friend = Friendship.create({
      from: userId,
      to: targetId,
      status: "requesting",
    });
  } catch (error) {
    next(error);
  }
};

userController.acceptFriendRequest = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

userController.declineFriendRequest = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

userController.cancelFriendRequest = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

userController.removeFriendship = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

module.exports = userController;
