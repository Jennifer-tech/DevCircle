require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const routes = require("./routes/authRoute");
const errorHandler = require("./middleware/errorHandler");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handleMentionEvent, handleCommentEvent, handlePostLikedEvent, handlePostSharedEvent } = require("./eventHandlers/authEventHandler");

const app = express();
const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo Connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

//   helmet
app.use(helmet()); //security rules are to come first
app.use(cors()); //block external requests before your app tries to read their content.
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

// Ip based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use("/api/auth/register", sensitiveEndpointsLimiter);

app.use("/api/auth", routes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    await consumeEvent("user.mentioned", handleMentionEvent);
    await consumeEvent("comment.created", handleCommentEvent);
    await consumeEvent('post.liked', handlePostLikedEvent)
    await consumeEvent('post.shared', handlePostSharedEvent)
    app.listen(PORT, () => {
      logger.info(`Auth service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}
startServer()

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
