const {rateLimit} = require('express-rate-limit')
const {RedisStore} = require('rate-limit-redis')
const Redis = require('ioredis')
const logger = require('../utils/logger')

const redisClient = new Redis(process.env.REDIS_URL)

const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 100,
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


module.exports = { searchLimiter }