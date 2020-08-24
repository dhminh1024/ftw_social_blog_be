"use strict";
const utilsHelper = {};

// This function controls the way we response to the client
// If we need to change the way to response later on, we only need to handle it here
utilsHelper.sendResponse = (
  res,
  status,
  success,
  data,
  error,
  message,
  token
) => {
  const response = {};
  if (success) response.success = success;
  if (data) response.data = data;
  if (error) response.error = { message: error.message };
  if (message) response.message = message;
  if (token) response.token = token;
  return res.status(status).json(response);
};

module.exports = utilsHelper;
