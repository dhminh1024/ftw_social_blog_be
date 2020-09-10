const fileUploadHelper = (filePath) => {
  const multer = require("multer");
  const path = require("path");
  const mkdirp = require("mkdirp");

  const storage = multer.diskStorage({
    destination: async (req, file, callback) => {
      const uploadPath = path.resolve(filePath);
      try {
        mkdirp.sync(uploadPath);
        callback(null, uploadPath);
      } catch (err) {
        callback(err);
      }
    },
    filename: function (req, file, callback) {
      const uniquePrefix = Date.now() + "_" + Math.round(Math.random() * 1e9);
      callback(null, uniquePrefix + "_" + file.originalname);
    },
  });
  return {
    uploader: multer({
      storage: storage,
      fileFilter: (req, file, callback) => {
        if (
          !file.mimetype.includes("jpeg") &&
          !file.mimetype.includes("jpg") &&
          !file.mimetype.includes("png")
        ) {
          return callback(null, false, new Error("Only images are allowed"));
        }
        callback(null, true);
      },
    }),
  };
};

module.exports = fileUploadHelper;
