const Jimp = require("jimp");
const fs = require("fs");

const photoHelper = {};

photoHelper.resize = async (req, res, next) => {
  if (req.file) {
    try {
      req.file.destination = "public" + req.file.destination.split("public")[1];
      req.file.path = "public" + req.file.path.split("public")[1];
      const image = await Jimp.read(req.file.path);
      await image.scaleToFit(400, 400).write(req.file.path);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next(new Error("Image required"));
  }
};

photoHelper.putTextOnImage = async (
  originalImagePath,
  outputMemePath,
  texts
) => {
  try {
    const image = await Jimp.read(originalImagePath);
    const dimension = {
      width: image.bitmap.width,
      height: image.bitmap.height,
    };
    const promises = texts.map(async (text) => {
      const font = await Jimp.loadFont(
        Jimp[`FONT_SANS_${text.size}_${text.color}`]
      );
      await image.print(
        font,
        0,
        0,
        {
          text: text.content,
          alignmentX: Jimp[text.alignmentX],
          alignmentY: Jimp[text.alignmentY],
        },
        dimension.width,
        dimension.height
      );
    });
    await Promise.all(promises);
    await image.writeAsync(outputMemePath);
  } catch (err) {
    throw err;
  }
};

module.exports = photoHelper;
