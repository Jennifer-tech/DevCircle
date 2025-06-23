const { publishEvent } = require('../utils/rabbitmq');
const User = require('../models/User')
const Redis = require("ioredis");
const logger = require('../utils/logger');

const redisClient = new Redis(process.env.REDIS_URL)

const handleMentionEvent = async(event) => {
    const { mentionedUsername, ...rest } = event;
    const cacheKey = `user:${mentionedUsername}`;

    let userData = await redisClient.get(cacheKey);
    if(!userData) {
        const user = await User.findOne({ username: mentionedUsername})
        console.log('user', user) 
        if(!user) {
            logger.warn(`User @${mentionedUsername} not found`)
            return
        }

        userData = { id: user._id, email: user.email};
        await redisClient.set(cacheKey, JSON.stringify(userData), 'EX', 3600);
    
    } else {
        userData = JSON.parse(userData)
    }
    await publishEvent('notification.mention', {
        ...rest,
        mentionedUserId: userData.id,
        mentionedUserEmail: userData.email,
        mentionedUsername,
    })
}

// const handleCommentEvent = async(event) => {
//     const { postId, ...rest } = event;
//     const cacheKey = `user:${mentionedUsername}`;

//     let userData = await redisClient.get(cacheKey);
//     if(!userData) {
//         const user = await User.findOne({ username: mentionedUsername})
//         console.log('user', user) 
//         if(!user) {
//             logger.warn(`User @${mentionedUsername} not found`)
//             return
//         }

//         userData = { id: user._id, email: user.email};
//         await redisClient.set(cacheKey, JSON.stringify(userData), 'EX', 3600);
    
//     } else {
//         userData = JSON.parse(userData)
//     }
//     await publishEvent('notification.mention', {
//         ...rest,
//         mentionedUserId: userData.id,
//         mentionedUserEmail: userData.email,
//         mentionedUsername,
//     })
// }

module.exports = { handleMentionEvent }