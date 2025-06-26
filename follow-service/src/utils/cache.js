const Redis = require("ioredis")
const redisClient = new Redis(process.env.REDIS_URL)

function getCacheKey(userId) {
    return `user:follow-count:${userId}`
}

async function getFollowCountCache(userId) {
    const cacheKey = getCacheKey(userId)
    const data = await redisClient.get(cacheKey);
    return data ? JSON.parse(data) : null
}

async function setFollowCountInCache(userId, countData) {
    const cacheKey = getCacheKey(userId);
    await redisClient.set(cacheKey, JSON.stringify(countData), 'EX', 3600)
}

async function invalidateFollowCountCache(userId) {
    await redisClient.del(getCacheKey(userId))
}


module.exports = {
  getFollowCountCache,
  setFollowCountInCache,
  invalidateFollowCountCache
};