require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const redis = require('ioredis')
const cors = require('cors')
const helmet = require('helmet')
const postRoutes = require('./routes/postRoutes')
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger")
const {createPostLimiter} = require("./middleware/rateLimiters")

const app = express()
const PORT = process.env.PORT || 3002

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info("Connected to mongodb"))
    .catch((e) => logger.error("Mongoose connection error", e))

const redisClient = new Redis(process.env.REDIS_URL)

app.use(helmet()) //security rules are to come first
app.use(cors()) //block external requests before your app tries to read their content.
app.use(express.json())

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next()
})
// in implementing rate limiting for post service, i can be kr hould be able to create 10 posts per minute and a user can access all posts the number they want
// any route you want to rateLimit, you have to pass it through the 
app.use('/api/posts/create-post', createPostLimiter)

app.use('/api/posts', (req, res, next) => {
    req.redisClient = redisClient
    next()
}, postRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
    logger.info(`Identity service running on port ${PORT}`)
})

// Unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
    logger.error('Unhandled Rejection at', promise, 'reason:', reason)
})

