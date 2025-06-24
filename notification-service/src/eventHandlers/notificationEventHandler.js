const Notification = require("../model/notificationModel");
const logger = require("../utils/logger");
const sendEmail = require("../utils/sendEmail");

const handleMentionNotification = async (event) => {
  try {
    logger.info("Received mention notification event:", event);
    const {
      mentionedUserId,
      mentionedUserEmail,
      mentionedByUserId,
      postId,
      commentId,
      content,
    } = event;
    console.log('mentionedUserId', mentionedUserId)

    if (!mentionedUserId || !mentionedUserEmail) {
      logger.error("Mention notification received without valid user info.");
      return; // Exit early to prevent saving invalid notification
    }

    const message = `You were mentioned in a comment: "${content}"`;

    const notification = new Notification({
      userId: mentionedUserId,
      type: "mention",
      message,
      metadata: {
        postId,
        commentId,
        content,
      },
    });
    await notification.save();
    logger.info("Creating notification for mention:", {
      userId: mentionedUserId,
      email: mentionedUserEmail,
      message,
    });

    await sendEmail({
      to: mentionedUserEmail,
      subject: "You were mentioned in a comment",
      text: message,
    });

    logger.info(`Email sent to ${mentionedUserEmail}`);
  } catch (err) {
    logger.error("Error in handleMentionNotification:", err);
    throw err;
  }
};

const handleCommentNotification = async (event) => {
  try {
    logger.info("Received comment notification event:", event);
    const {
      commenterId,
      commenterEmail,
      commenterUsername,
      postId,
      commentId,
      content,
    } = event;

    const message = `${commenterUsername} commented on your post`;
    const notification = new Notification({
      userId: commenterId,
      type: "comment",
      message,
      metadata: {
        postId,
        commentId,
        content,
      },
    });
    await notification.save();
    logger.info(`Comment notification saved for post ${postId}`);
  } catch (err) {
    logger.error("Error in handleMentionNotification:", err);
    throw err;
  }
};

const handlePostLikedNotification = async (event) => {
  try {
    logger.info("Received like notification event:", event);
    const {
      postId,
      postOwnerId,
      likerUserName
    } = event;

    const message = `${likerUserName} liked your post`;
    const notification = new Notification({
      userId: postOwnerId,
      type: "like",
      message,
      metadata: {
        postId,
      },
    });
    await notification.save();
    logger.info(`Like notification saved for post ${postId}`);
  } catch (err) {
    logger.error("Error in handlePostLikedNotification:", err);
    throw err;
  }
};

module.exports = { handleMentionNotification, handleCommentNotification, handlePostLikedNotification };
