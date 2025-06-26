const Notification = require("../model/notificationModel");
const logger = require("../utils/logger");
const { publishEvent, publishRpcEvent } = require("../utils/rabbitmq");
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
    const { postId, postOwnerId, likerUserName } = event;

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
const handlePostSharedNotification = async (event) => {
  try {
    logger.info("Received post shared notification event:", event);
    const { postId, postOwnerId, sharerUserName } = event;

    const message = `${sharerUserName} shared your post`;
    const notification = new Notification({
      userId: postOwnerId,
      type: "share",
      message,
      metadata: {
        postId,
      },
    });
    await notification.save();
    logger.info(`Share notification saved for post ${postId}`);
  } catch (err) {
    logger.error("Error in handlePostSharedNotification:", err);
    throw err;
  }
};

const handleUserFollowed = async (event) => {
  const { followerId, followingId } = event;

  const followerInfo = await publishRpcEvent("user.getInfo", {
    userId: followerId,
  });
  const followingInfo = await publishRpcEvent("user.getInfo", {
    userId: followingId,
  });

  const message = `${followerInfo.username} followed you`;

  const notification = new Notification({
    userId: followingId,
    type: "follow",
    message,
    metadata: { followerId },
  });
  await notification.save();
  logger.info(`Follow notification saved for ${followingId}`);

  await sendEmail({
    to: followingInfo.email,
    subject: "You got a new follower!",
    text: message,
  });
};

module.exports = {
  handleMentionNotification,
  handleCommentNotification,
  handlePostLikedNotification,
  handlePostSharedNotification,
  handleUserFollowed,
};
