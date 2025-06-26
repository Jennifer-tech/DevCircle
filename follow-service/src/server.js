require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger")
const Redis = require('ioredis')
const followRoutes = require("./routes/followRoute");
const { connectToRabbitMQ } = require('./utils/rabbitmq')

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

app.use("/api/follow", (req, res, next) => {
    req.redisClient = redisClient
    next()
}, followRoutes);

app.use(errorHandler)

async function startServer() {
    try{
        await connectToRabbitMQ()

        app.listen(PORT, () => {
            logger.info(`Follow service running on port ${PORT}`)
        })
    } catch(error) {
        logger.error('Failed to connect to server', error)
        process.exit(1)
    }
}
startServer()

// Unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
    if (reason instanceof Error) {
    logger.error('Unhandled Rejection:', reason.stack || reason.message);
  } else {
    logger.error('Unhandled Rejection (non-error):', JSON.stringify(reason));
  }
})