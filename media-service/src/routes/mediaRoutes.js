const express = require("express");
// const multerS3 = require("multer-s3");
const multer = require("multer")
// const AWS = require("aws-sdk");
const { uploadMedia, getAllMedias } = require("../controllers/mediaController");
const { authenticateRequest } = require("../middleware/authMiddleware");
const logger = require("../utils/logger");
const { createMediaLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

router.post("/upload", authenticateRequest, upload.single("file"), createMediaLimiter, uploadMedia)

router.get("/all", authenticateRequest, getAllMedias);

module.exports = router;

