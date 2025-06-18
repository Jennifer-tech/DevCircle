require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger")
const { connectToRabbitMQ, consumeEvent } = require('./utils/rabbitmq')
const searchRoutes = require('./routes/searchRoutes')
const { handlePostCreated, handlePostDeleted } = require('./eventHandlers/searchEventHandlers')
const Redis = require('ioredis')

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

app.use('/api/search', searchRoutes)

app.use(errorHandler)

async function startServer() {
    try{
        await connectToRabbitMQ()

        await consumeEvent("post.created", handlePostCreated)
        await consumeEvent("post.deleted", handlePostDeleted)
        app.listen(PORT, () => {
            logger.info(`Search service running on port ${PORT}`)
        })
    } catch(error) {
        logger.error('Failed to connect to server', error)
        process.exit(1)
    }
}
startServer()