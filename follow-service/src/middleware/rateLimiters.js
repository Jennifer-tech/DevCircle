const {rateLimit} = require('express-rate-limit')
const {RedisStore} = require('rate-limit-redis')
const Redis = require('ioredis')
const logger = require('../utils/logger')

const redisClient = new Redis(process.env.REDIS_URL)

const checkFollowLimiter = rateLimit({
    windowMs: 60 * 1000, //1 minute
    max: 20,
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
const mutualFollowLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, //5 minutes
    max: 10,
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

module.exports = {checkFollowLimiter, mutualFollowLimiter }