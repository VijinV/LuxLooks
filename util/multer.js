const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: "../public/productImages",
  filename: (req, file, cb) => {
    cb(
      null,
      path.basename(file.originalname).split(".")[0] +
        "_" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const uploadFile = upload.single("image");

module.exports = {
  uploadFile,
};
