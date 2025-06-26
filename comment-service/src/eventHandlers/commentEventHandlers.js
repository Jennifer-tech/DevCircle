const Comment = require("../models/commentModel");
const logger = require("../utils/logger");

const handlePostDeleted = async (event) => {

  const { postId, commentIds } = event;

  try {
    const commentsToDelete = await Comment.find({ _id: { $in: commentIds } });

    for (const comment of commentsToDelete) {
      await Comment.findByIdAndDelete(comment._id);
      logger.info(
        `Deleted comment ${comment._id} associated with this deleted post ${postId}`
      );
    }

    logger.info(
      `Successfully deleted all media associated with post ${postId}`
    );
  } catch (e) {
    logger.error(e, "Error occured while deleting media");
  }
};

module.exports = { handlePostDeleted }