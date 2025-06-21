const express = require('express')
const {createComment, getAllPostComments, deleteComment, getComment, updateComment} = require('../controllers/commentController')
const {authenticateRequest} = require('../middleware/authMiddleware')
const { createCommentLimiter, getAllCommentLimiter } = require('../middleware/rateLimiter')
const { likeComment, getTotalCommentLikes } = require('../controllers/commentLikeController')


const router = express.Router()

router.use(authenticateRequest)

router.post('/create-comment', createCommentLimiter, createComment)
router.get('/:postId/all-comment', getAllCommentLimiter, getAllPostComments)
router.get('/:id', getComment)
router.delete('/:id', deleteComment)
router.patch('/:id', updateComment)

router.post('/like', likeComment);
router.get('/:commentId/likes', getTotalCommentLikes);

module.exports = router