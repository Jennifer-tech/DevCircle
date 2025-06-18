const express = require('express')
const {createPost, getAllPosts, getPost, deletePost} = require('../controllers/postController')
const {authenticateRequest} = require('../middleware/authMiddleware')
const { createPostLimiter, getAllPostLimiter } = require('../middleware/rateLimiters')

const router = express.Router()

router.use(authenticateRequest)

router.post('/create-post', createPostLimiter, createPost)
router.get('/all-posts', getAllPostLimiter, getAllPosts)
router.get('/:id', getPost)
router.delete('/:id', deletePost)

module.exports = router