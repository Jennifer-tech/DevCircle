const logger = require("../utils/logger")

const errorHandler = (err, res, next) => {
    logger.error(err.stack)

    res.status(err.status || 500).json({
        message: err.message || "Internal Server error"
    })
}

module.exports = errorHandler