const {rateLimit} = require('express-rate-limit')
const {RedisStore} = require('rate-limit-redis')
const Redis = require('ioredis')

const redisClient = new Redis(process.env.REDIS_URL)

const createPostLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many requests"})
    },
    store: new RedisStore({
        sendCommand: (...args)=> redisClient.call(...args),
    })
})
const getPostsLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 minutes
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many requests"})
    },
    store: new RedisStore({
        sendCommand: (...args)=> redisClient.call(...args),
    })
})

module.exports = {createPostLimiter, getPostsLimiter }