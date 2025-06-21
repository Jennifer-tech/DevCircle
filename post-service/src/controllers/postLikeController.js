const PostLike = require("../models/postLikeModel");
const Post = require("../models/postModel");
const logger = require("../utils/logger");

const likePost = async (req, res) => {
  logger.info("Like post endpoint hit");

  try {
    const userId = req.user.userId;
    const { postId } = req.body;

    const existingLike = await PostLike.findOne({
      userId,
      postId,
    });

    if (!existingLike) {
      const newLike = new PostLike({
        userId,
        postId,
      });
      await newLike.save();

      await Post.findByIdAndUpdate(postId, {
        $addToSet: { likes: newLike._id}
      })
      logger.info(`Post liked by user: ${userId} for post: ${postId}`);
      return res.status(201).json({
        success: true,
        message: "Post liked successfully",
        like: newLike,
      });
    }

    await PostLike.deleteOne({
      userId,
      postId,
    });

    await Post.findByIdAndUpdate(postId, {
        $pull: { likes: existingLike._id}
    })
    logger.info(`Post unliked by user: ${userId} for post: ${postId}`);
    return res.status(200).json({
      success: true,
      message: "Post unliked successfully",
    });
  } catch (error) {
    logger.error("Error liking post", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getTotalPostLikes = async (req, res) => {
  const { postId } = req.params;
  try {
    const totalLikes = await PostLike.countDocuments({ postId });
    return res.status(200).json({
      success: true,
      totalLikes,
    });
  } catch (e) {
    logger.error("Error fetching total likes for comment", e);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { likePost, getTotalPostLikes };
