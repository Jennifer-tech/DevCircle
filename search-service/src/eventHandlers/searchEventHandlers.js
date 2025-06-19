const Search = require('../models/searchModel');
const logger = require('../utils/logger');

async function handlePostCreated(event) {
    try{
        const newsSearchPost = new Search({
            postId: event.postId,
            userId: event.userId,
            content: event.content,
            createdAt: event.createdAt
        });
        await newsSearchPost.save();
        logger.info(`Search post created for postId: ${event.postId}, ${newsSearchPost._id.toString()}`);
    } catch(e) {
        logger.error("Error handling post creation event", e)
    }
}

async function handlePostDeleted(event) {
    try {
        await Search.findOneAndDelete({ postId: event.postId });
        logger.info(`Search post deleted for postId: ${event.postId}`);
    }catch(error) {
       logger.error("Error handling post creation event", error)
    }
}

module.exports = { handlePostCreated, handlePostDeleted }