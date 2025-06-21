const CommentLike = require('../models/commentLikeModel');
// const commentLike = require('../models/commentLikeModel');
const logger = require('../utils/logger');

const likeComment = async (req, res) => {
    logger.info("Like comment endpoint hit");

    try{
        const userId = req.user.userId;
        console.log("userId", userId);
        const { commentId } = req.body;

        const existingLike = await CommentLike.findOne({
            userId,
            commentId
        })
        console.log("existingLike", existingLike);

        if(!existingLike) {
            const newLike = new CommentLike({
                userId,
                commentId
            })
            await newLike.save();
            logger.info(`Comment liked by user: ${userId} for comment: ${commentId}`);
            return res.status(201).json({
                success: true,
                message: "Comment liked successfully",
                like: newLike
            });

        }
        await CommentLike.deleteOne({
            userId,
            commentId
        })
    } catch (error) {
        logger.error("Error liking comment", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

const getTotalCommentLikes = async (req, res) => {
    const {commentId} = req.params;
    try{
        const totalLikes = await CommentLike.countDocuments({ commentId});
        return res.status(200).json({
            success: true,
            totalLikes
        });
    } catch(e) {
        logger.error("Error fetching total likes for comment", e);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    likeComment,
    getTotalCommentLikes
};