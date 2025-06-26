const Follow = require("../models/followModel");
const {
  invalidateFollowCountCache,
  setFollowCountInCache,
  getFollowCountCache,
} = require("../utils/cache");
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitmq");

async function fetchUserDetails(userIds) {
  const results = [];

  for (const userId of userIds) {
    try {
      const user = await publishEvent("user.getInfo", { userId });
      results.push({ userId, ...user });
    } catch (e) {
      logger.warn(`Could not fetch user info for ${userId}`);
      results.push({ userId });
    }
  }
  return results;
}

const followUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { followingId } = req.body;

    if (followerId === followingId) {
      return res
        .status(400)
        .json({ success: false, message: "You can't follow yourself" });
    }

    const follow = new Follow({
      follower: followerId,
      following: followingId,
    });
    await follow.save();

    await invalidateFollowCountCache(followerId);
    await invalidateFollowCountCache(followingId);

    await publishEvent("user.followed", {
      followerId,
      followingId,
    });

    res
      .status(201)
      .json({ success: true, message: "User followed successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Already following this user" });
    }
    logger.error("Follow error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { followingId } = req.body;

    await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    await invalidateFollowCountCache(followerId);
    await invalidateFollowCountCache(followingId);

    await publishEvent("user.unfollowed", {
      followerId,
      followingId,
    });

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (err) {
    logger.error("Unfollow error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFollowerFollowingCount = async (req, res) => {
  try {
    const { userId } = req.params;

    let counts = await getFollowCountCache(userId);
    if (!counts) {
      const followers = await Follow.countDocuments({ following: userId });
      const following = await Follow.countDocuments({ follower: userId });

      counts = { followers, following };
      await setFollowCountInCache(userId, counts);
    }

    res.json({ success: true, ...counts });
  } catch (err) {
    logger.error("Count error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFollowers = async (req, res) => {
    try{
        const {userId} = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const followers = await Follow.find({ following: userId })
            .skip(skip)
            .limit(limit)
            .select('follower');

        const followerIds = followers.map(f => f.follower.toString());
        const followerDetails = await fetchUserDetails(followerIds)

        res.json({
            success: true,
            page,
            count: followerIds.length,
            followers: followerDetails
        })

    } catch (e) {
    logger.error("Error fetching followers", e);
    res.status(500).json({ success: false, message: "Error fetching followers" });
  }
}

const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit

        const following = await Follow.find({ follower: userId })
            .skip(skip)
            .limit(limit)
            .select('following')
        const followingIds = following.map(f => f.following.toString());
        const followingDetails = await fetchUserDetails(followingIds)
        res.json({
            success: true,
            page,
            count: followingIds.length,
            following: followingDetails
        })
    } catch (e) {
    logger.error("Error fetching following", e);
    res.status(500).json({ success: false, message: "Error fetching following" });
  }
}

const isFollowing = async (req, res) => {
  try {
    const { userA, userB } = req.params;

    const follow = await Follow.findOne({
      follower: userA,
      following: userB,
    });
    res.json({
      success: true,
      isFollowing: !!follow,
    });
  } catch (e) {
    logger.error("Error checking follow status", e);
    res
      .status(500)
      .json({ success: false, message: "Error checking follow status" });
  }
};

const getMutualFollowers = async (req, res) => {
  try {
    const { userA, userB } = req.params;

    const followersA = await Follow.find({ following: userA }).select(
      "follower"
    );
   
    const followersASet = new Set(followersA.map((f) => f.follower.toString()));

    const followersB = await Follow.find({ following: userB }).select(
      "follower"
    );

    const mutual = followersB
      .map((f) => f.follower.toString())
      .filter((id) => followersASet.has(id));

     
    const mutualDetails = await fetchUserDetails(mutual);

    res.json({
      success: true,
      mutualFollowers: mutualDetails,
    });
  } catch (e) {
    logger.error("Error fetching mutual followers", e);
    res
      .status(500)
      .json({ success: false, message: "Error fetching mutual followers" });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowerFollowingCount,
  isFollowing,
  getMutualFollowers,
  getFollowers,
  getFollowing
};
