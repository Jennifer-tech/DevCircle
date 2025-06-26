const { publishEvent } = require("../utils/rabbitmq");
const User = require("../models/User");
const Redis = require("ioredis");
const logger = require("../utils/logger");

const redisClient = new Redis(process.env.REDIS_URL);

const handleMentionEvent = async (event) => {
  const { mentionedUsername, ...rest } = event;

  if (!mentionedUsername) {
    logger.warn("Mention event received without mentionedUsername, skipping.");
    return;
  }

  const cacheKey = `user:${mentionedUsername}`;

  let userData = await redisClient.get(cacheKey);
  if (!userData) {
    const user = await User.findOne({ username: mentionedUsername });
    
    if (!user) {
      logger.warn(`User @${mentionedUsername} not found`);
      return;
    }

    userData = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    };
    await redisClient.set(cacheKey, JSON.stringify(userData), "EX", 3600);
  } else {
    userData = JSON.parse(userData);
  }
  await publishEvent("notification.mention", {
    ...rest,
    mentionedUserId: userData.id,
    mentionedUserEmail: userData.email,
    mentionedUsername,
  });
};

const handleCommentEvent = async (event) => {
  const { userId, ...rest } = event;
  const cacheKey = `user:${userId}`;

  let userData = await redisClient.get(cacheKey);
  
  if (!userData) {
    const user = await User.findOne({ _id: userId });
    
    if (!user) {
      logger.warn(`UserId not found`);
      return;
    }

    userData = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    };
    await redisClient.set(cacheKey, JSON.stringify(userData), "EX", 3600);
  } else {
    userData = JSON.parse(userData);
  }
  await publishEvent("comment.created.notification", {
    ...rest,
    commentId: userId,
    commenterEmail: userData.email,
    commenterUsername: userData.username,
  });
};

const handlePostLikedEvent = async (event) => {
  
  const { userId, postId, postOwnerId } = event;
  const cacheKey = `user:${userId}`;

  let userData = await redisClient.get(cacheKey);
  
  if (!userData) {
    const user = await User.findOne({ _id: userId });
 
    if (!user) {
      logger.warn(`UserId not found`);
      return;
    }

    userData = { email: user.email, username: user.username };
    
    await redisClient.set(cacheKey, JSON.stringify(userData), "EX", 3600);
  } else {
    userData = JSON.parse(userData);
    
  }
  await publishEvent("post.like.notification", {
    postId,
    postOwnerId,
    likerId: userId,
    likerUserEmail: userData.email,
    likerUserName: userData.username,
  });
};

const handlePostSharedEvent = async (event) => {
  
  const { userId, postId, postOwnerId } = event;
  const cacheKey = `user:${userId}`;

  let userData = await redisClient.get(cacheKey);
  
  if (!userData) {
    const user = await User.findOne({ _id: userId });
    
    if (!user) {
      logger.warn(`UserId not found`);
      return;
    }

    userData = { email: user.email, username: user.username };
    
    await redisClient.set(cacheKey, JSON.stringify(userData), "EX", 3600);
  } else {
    userData = JSON.parse(userData);
    
  }
  await publishEvent("post.share.notification", {
    postId,
    postOwnerId,
    sharerId: userId,
    sharerUserEmail: userData.email,
    sharerUserName: userData.username,
  });
};

const getUserInfoEvent = async (event) => {
  try {
    const { userId } = event;

    const cacheKey = `user:${userId}`;
    let userData = await redisClient.get(cacheKey);
 
    if (!userData) {
      const user = await User.findOne({ _id: userId });

      if (!user) {
        logger.warn(`UserId not found`);
        return;
      }

      userData = { email: user.email, username: user.username };

      await redisClient.set(cacheKey, JSON.stringify(userData), "EX", 3600);
    } else {
      userData = JSON.parse(userData);
    }
    return userData;
  } catch (err) {
    logger.error("Error in getUserInfoEvent:", err);
    throw err;
  }
};

module.exports = {
  handleMentionEvent,
  handleCommentEvent,
  handlePostLikedEvent,
  handlePostSharedEvent,
  getUserInfoEvent,
};
