const express = require('express')
const {createPost, getAllPosts, getPost, deletePost, updatePost} = require('../controllers/postController')
const {authenticateRequest} = require('../middleware/authMiddleware')
const { createPostLimiter, getAllPostLimiter } = require('../middleware/rateLimiters')
const { likePost, getTotalPostLikes } = require('../controllers/postLikeController')

const router = express.Router()

router.use(authenticateRequest)

router.post('/create-post', createPostLimiter, createPost)
router.get('/all-posts', getAllPostLimiter, getAllPosts)
router.get('/:id', getPost)
router.delete('/:id', deletePost)
router.patch('/:id', updatePost)

router.post('/like', likePost);
router.get('/:postId/likes', getTotalPostLikes);

module.exports = router