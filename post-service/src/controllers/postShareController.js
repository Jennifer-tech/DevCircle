const PostShare = require("../models/postShareModel");
const Post = require("../models/postModel");
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitmq");

const sharePost = async (req, res) => {
  logger.info("Share post endpoint hit");

  try {
    const userId = req.user.userId;
    const { postId } = req.body;

    const newShare = new PostShare({
      userId,
      postId,
    });
    await newShare.save();

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    const postOwnerId = post.user.toString();

    await publishEvent("post.shared", {
      userId,
      postId,
      postOwnerId,
    });

    await Post.findByIdAndUpdate(postId, {
      $addToSet: { shares: newShare._id },
    });
    logger.info(`Post shared by user: ${userId} for post: ${postId}`);
    return res.status(201).json({
      success: true,
      message: "Post shared successfully",
      share: newShare,
    });
  } catch (error) {
    logger.error("Error sharing post", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getTotalPostShares = async (req, res) => {
  const { postId } = req.params;
  try {
    const totalShares = await PostShare.countDocuments({ postId });
    return res.status(200).json({
      success: true,
      totalShares,
    });
  } catch (e) {
    logger.error("Error fetching total shares for comment", e);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { sharePost, getTotalPostShares };
