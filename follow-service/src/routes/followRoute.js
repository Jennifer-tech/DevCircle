const express = require('express');
const { authenticateRequest } = require('../middleware/authMiddleware');
const { followUser, unfollowUser, getFollowerFollowingCount, getFollowers, getFollowing, isFollowing, getMutualFollowers } = require('../controllers/followController');
const {
  checkFollowLimiter,
  mutualFollowLimiter,
} = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/', authenticateRequest, followUser);
router.post('/unfollow', authenticateRequest, unfollowUser);
router.get('/:userId/count', getFollowerFollowingCount);
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);
router.get('/is-following/:userA/:userB', checkFollowLimiter, isFollowing);
router.get('/mutual/:userA/:userB', mutualFollowLimiter, getMutualFollowers);

module.exports = router;
