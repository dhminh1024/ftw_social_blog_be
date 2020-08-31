const utilsHelper = require("../helpers/utils.helper");
const Reaction = require("../models/reaction");
const mongoose = require("mongoose");
const reactionController = {};

reactionController.saveReaction = async (req, res, next) => {
  try {
    const { targetType, target, emoji } = req.body;
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
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      reactionStat.reactions,
      null,
      message
    );
  } catch (error) {
    next(error);
  }
};

module.exports = reactionController;
