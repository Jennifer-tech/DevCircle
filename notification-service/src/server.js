require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger")
const Redis = require('ioredis')
const { connectToRabbitMQ, consumeEvent } = require('./utils/rabbitmq')
const { handleMentionNotification, handleCommentNotification, handlePostLikedNotification, handlePostSharedNotification } = require('./eventHandlers/notificationEventHandler')

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

app.use(errorHandler)

async function startServer() {
    try{
        await connectToRabbitMQ()

        await consumeEvent("notification.mention", handleMentionNotification)
        await consumeEvent("comment.created.notification", handleCommentNotification)
        await consumeEvent("post.like.notification", handlePostLikedNotification)
        await consumeEvent("post.share.notification", handlePostSharedNotification)
        // await consumeEvent("comment.deleted", handleCommentDeleted)

        app.listen(PORT, () => {
            logger.info(`Notification service running on port ${PORT}`)
        })
    } catch(error) {
        logger.error('Failed to connect to server', error)
        process.exit(1)
    }
}
startServer()

// Unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
    logger.error('Unhandled Rejection at', promise, 'reason:', reason)
})