const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const Reaction = require("../models/Reaction");
const mongoose = require("mongoose");
const reactionController = {};

reactionController.saveReaction = catchAsync(async (req, res, next) => {
  const { targetType, target, emoji } = req.body;

  const targetObj = await mongoose.model(targetType).findById(target);
  if (!targetObj)
    return next(
      new AppError(404, `${targetType} not found`, "Create Reaction Error")
    );

  // Find the reaction of the current user
  let reaction = await Reaction.findOne({
    targetType,
    target,
    user: req.userId,
  });
  let message = "";
  if (!reaction) {
    await Reaction.create({ targetType, target, user: req.userId, emoji });
    message = "Added reaction";
  } else {
    if (reaction.emoji === emoji) {
      await Reaction.findOneAndDelete({ _id: reaction._id });
      message = "Removed reaction";
    } else {
      await Reaction.findOneAndUpdate({ _id: reaction._id }, { emoji });
      message = "Updated reaction";
    }
  }
  // Get the updated number of reactions in the targetType
  const reactionStat = await mongoose
    .model(targetType)
    .findById(target, "reactions");
  return sendResponse(res, 200, true, reactionStat.reactions, null, message);
});

module.exports = reactionController;
