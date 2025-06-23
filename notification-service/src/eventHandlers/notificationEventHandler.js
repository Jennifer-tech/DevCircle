
const Notification = require("../model/notificationModel");
const logger = require("../utils/logger");
const sendEmail = require("../utils/sendEmail");

const handleMentionNotification = async (event) => {
  try {
    logger.info('Received mention notification event:', event);
    const {
      mentionedUserId,
      mentionedUserEmail,
      mentionedByUserId, 
      postId, 
      commentId, 
      content
    } = event

  const message = `You were mentioned in a comment: "${content}"`;

    const notification = new Notification({
      userId: mentionedUserId,
      type: 'mention',
      message,
      metadata: {
        postId,
        commentId,
        content
      }
    });
    await notification.save();
    logger.info(`Mention notification saved for user ${mentionedUserId}`);

    await sendEmail({
      to: mentionedUserEmail,
      subject: 'You were mentioned in a comment',
      text: message,
    })

    logger.info(`Email sent to ${mentionedUserEmail}`);
  } catch (err) {
    logger.error("Error in handleMentionNotification:", err);
    throw err; 
  }
}

handleCommentNotification = async (event) => {
  try {
    logger.info('Received mention notification event:', event);
    const {
      mentionedUserId,
      mentionedUserEmail,
      mentionedByUserId, 
      postId, 
      commentId, 
      content
    } = event

    const notification = new Notification({
      userId: mentionedUserId,
      type: 'comment',
      message,
      metadata: {
        postId,
        commentId,
        content
      }
    });
    await notification.save();
    logger.info(`Comment notification saved for user ${mentionedUserId}`);
  } catch (err) {
    logger.error("Error in handleMentionNotification:", err);
    throw err;
  }
}

module.exports = { handleMentionNotification }