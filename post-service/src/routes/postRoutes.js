const express = require('express')
const {createPost, getAllPosts, getPost, deletePost, updatePost} = require('../controllers/postController')
const {authenticateRequest} = require('../middleware/authMiddleware')
const { createPostLimiter, getAllPostLimiter } = require('../middleware/rateLimiters')
const { likePost, getTotalPostLikes } = require('../controllers/postLikeController')
const { sharePost, getTotalPostShares } = require('../controllers/postShareController')

const router = express.Router()

router.use(authenticateRequest)

router.post('/create-post', createPostLimiter, createPost)
router.get('/all-posts', getAllPostLimiter, getAllPosts)
router.get('/:id', getPost)
router.delete('/:id', deletePost)
router.patch('/:id', updatePost)

router.post('/like', likePost);
router.get('/:postId/likes', getTotalPostLikes);

router.post('/share', sharePost);
router.get('/:postId/shares', getTotalPostShares);

module.exports = router