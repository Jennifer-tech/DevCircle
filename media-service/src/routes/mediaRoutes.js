const express = require('express');
const multer = require('multer');
const { uploadMedia, getAllMedias } = require('../controllers/mediaController')
const { authenticateRequest } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const { createMediaLimiter } = require('../middleware/rateLimiter');

const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
}).single('file')

router.post('/upload', authenticateRequest, (req, res, next) => {
    upload(req, res, (err) => {
        if(err instanceof multer.MulterError) {
            logger.error(`Multer error while uploading:`, err)
            return res.status(400).json({
                message: 'Multer error while uploading:',
                error: err.message,
                stack: err.stack
            })
        } else if(err) {
            logger.error(`Unknown error occured while uploading:`, err)
            return res.status(500).json({
                message: 'Unknown error occured while uploading:',
                error: err.message,
                stack: err.stack
            })
        }

        if(!req.file){
            return res.status(400).json({
                message: 'No file found!',
            })
        }

        next()
    })
}, createMediaLimiter, uploadMedia)

router.get('/all', authenticateRequest, getAllMedias)

module.exports = router