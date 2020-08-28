const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const authMiddleware = {};

authMiddleware.loginRequired = function (req, res, next) {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      return next(new Error("Token not found, authorization denied!"));
    }
    const token = tokenString.replace("Bearer ", "");
    // console.log(token);
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return next(new Error("Token Expired"));
        } else {
          return next(new Error("Token is not valid"));
        }
      } else {
        req.userId = payload._id;
      }
    });
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
