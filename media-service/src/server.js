require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const mediaRoutes = require('./routes/mediaRoutes')
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger")
const { createMediaLimiter } = require('./middleware/rateLimiter')

const app = express()
const PORT = process.env.PORT || 3003

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info("Connected to mongodb"))
    .catch((e) => logger.error("Mongoose connection error", e))

app.use(helmet()) //security rules are to come first
app.use(cors()) //block external requests before your app tries to read their content.
app.use(express.json())

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next()
})

app.use('api/media/upload', createMediaLimiter)

app.use('/api/media', mediaRoutes)
app.use(errorHandler)

app.listen(PORT, () => {
    logger.info(`Media service running on port ${PORT}`)
})

// Unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
    logger.error('Unhandled Rejection at', promise, 'reason:', reason)
})
