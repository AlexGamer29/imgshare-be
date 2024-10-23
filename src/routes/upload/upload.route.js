const express = require('express');

const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../../config/s3');
const { S3_BUCKET_NAME } = require('../../config/config');
const {
  getCurrentDate,
  generateHash,
} = require('../../helpers/general.helper');
const { uploadImage } = require('../../controllers/index.controller');

// Set up multer with S3 storage and custom file path
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      // console.log(req.user.username);
      const username = req.user.username; // Username extracted from token
      const date = getCurrentDate(); // Get today's date in YYYYMMDD format
      const hash = generateHash(); // Generate a unique hash
      const fileExtension = file.originalname.split('.').pop(); // Get the file extension (e.g., png, jpg)

      // Construct the file path: /username/day/hash.png
      const filePath = `${username}/${date}/${hash}.${fileExtension}`;

      cb(null, filePath); // Pass the full path to the key function
    },
  }),
});

// Create a POST route to upload an image
router.post('/img', upload.single('image'), uploadImage);

module.exports = router;
