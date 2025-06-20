const Post = require("../models/Post");
const logger = require("../utils/logger");

const handleCommentCreated = async (event) => {
  console.log(event, "eventeventevent3");

  const { postId, commentId } = event;
  try {
    const post = await Post.findById(postId);
    if(!post) {
        logger.error(`Post with ID ${postId} not found`);
        return;
    }
    // Check if the comment ID already exists in the post's comments array
    if (post.comments.includes(commentId)) {
      logger.info(
        `Comment ${commentId} already exists in post ${postId}, skipping addition`
      );
      return;
    }
    // Add the comment ID to the post's comments array
    post.comments.push(commentId);
  } catch (e) {
    logger.error(e, "Error occured while adding comment from post");
  }
}
const handleCommentDeleted = async (event) => {
  console.log(event, "eventeventevent4");

  const { postId, commentId } = event;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      logger.error(`Post with ID ${postId} not found`);
      return;
    }
    // Remove the comment ID from the post's comments array
    post.comments = post.comments.filter(
      (comment) => comment.toString() !== commentId
    );
    await post.save();
    logger.info(
      `Successfully removed comment ${commentId} from post ${postId}`
    );
  } catch (e) {
    logger.error(e, "Error occured while removing comment from post");
  }
};

module.exports = { handleCommentCreated, handleCommentDeleted };