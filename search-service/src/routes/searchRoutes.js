const express = require('express');
const { authenticateRequest } = require('../middleware/authMiddleware');
const { searchPostController } = require('../controllers/searchController');
const { searchLimiter } = require('../middleware/rateLimiters');

const router = express.Router()

router.use(authenticateRequest)

router.get('/posts', searchLimiter, searchPostController)

module.exports = router;