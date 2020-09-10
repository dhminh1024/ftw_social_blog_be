var express = require("express");
var router = express.Router();

// userApi
const userApi = require("./user.api");
router.use("/users", userApi);

// authApi
const authApi = require("./auth.api");
router.use("/auth", authApi);

// blogApi
const blogApi = require("./blog.api");
router.use("/blogs", blogApi);

// reviewApi
const reviewApi = require("./review.api");
router.use("/reviews", reviewApi);

// reactionApi
const reactionApi = require("./reaction.api");
router.use("/reactions", reactionApi);

// friendshipApi
const friendshipApi = require("./friendship.api");
router.use("/friends", friendshipApi);

// conversationApi
const conversationApi = require("./conversation.api");
router.use("/conversations", conversationApi);

module.exports = router;
