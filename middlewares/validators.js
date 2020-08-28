const utilsHelper = require("../helpers/utils.helper");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const validators = {};

validators.validate = (validationArray) => async (req, res, next) => {
  await Promise.all(validationArray.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extractedErrors = [];
  console.log(errors.array());
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  return utilsHelper.sendResponse(
    res,
    422,
    false,
    null,
    extractedErrors,
    "Validation Error"
  );
};

validators.checkObjectId = (paramId) => {
  if (!mongoose.Types.ObjectId.isValid(paramId)) {
    throw new Error("Invalid ObjectId");
  }
  return true;
};

module.exports = validators;

// validators.checkObjectId = (paramId) => (req, res, next) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params[paramId]))
//     return utilsHelper.sendResponse(
//       res,
//       400,
//       false,
//       null,
//       [{ id: "Invalid ObjectId" }],
//       "Validation Error"
//     );
//   next();
// };
