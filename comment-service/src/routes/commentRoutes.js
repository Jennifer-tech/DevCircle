const express = require('express')
const {createComment} = require('../controllers/commentController')
const {authenticateRequest} = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authenticateRequest)

router.post('/create-comment', createComment)