const Comment = require("../models/commentModel");
const logger = require("../utils/logger");
const { validateCreateComment } = require("../utils/validation");

async function invalidateCommentCache(req, input) {
    const cacheKey = `comment:${input}`;
    await req.redisClient.del(cacheKey)
    const keys = await req.redisClient.keys("comments:*")
    if(keys.length > 0) {
        await req.redisClient.del(keys)
    }
}

const createComment = async (req, res) => {
  logger.info("Create comment endpoint hit");

  try {
    const { error } = validateCreateComment(req.body);

    if (!error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { content, postId } = req.body;
    const newlyCreatedComment = new Comment({
      user: req.user.userId,
      content,
      postId,
    });

    await newlyCreatedComment.save();
    await publishEvent('comment.created', {
        commentId: newlyCreatedComment._id.toString(),
        userId: newlyCreatedComment.user.toString(),
        content: newlyCreatedComment.content,
        postId: newlyCreatedComment.postId.toString(),
        createdAt: newlyCreatedComment.createdAt,
    })
    await invalidateCommentCache(req, newlyCreatedComment._id.toString())
    logger.info("Comment created successfully", newlyCreatedComment);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (e) {
    logger.error("Error creating comment", e);
    res.status(500).json({
      success: false,
      message: "Error creating comment",
    });
  }
};

const getAllPostComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `comments: ${page}: ${limit}`;
    const cachedComments = await req.redisClient.get(cacheKey);
    if (cachedComments) {
      return res.json(JSON.parse(cachedComments));
    }

    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    const totalNoOfComments = await Comment.countDocuments({
      postId: req.params.postId,
    });

    const result = {
      comments,
      currentPage: page,
      totalPages: Math.ceil(totalNoOfComments / limit),
      totalComments: totalNoOfComments,
    };

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.json(result);
  } catch (e) {
    logger.error("Error fetching comments", e);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
    });
  }
};

// const getUserPostComment = async (req, res) => {
//     try{
//         const userId = req.user.userId;
//         const postId = req.params.postId;
//         const cacheKey = `userComments:${userId}`;
//         const cachedComments = await req.redisClient.get(cacheKey);

//         if(cachedComments) {
//             return res.json(JSON.parse(cachedComments));
//         }

//         const 
//         const comments = await Comment.find({ user: userId})
//             .sort({ createdAt: -1 });
        

//     } catch (e) {
//         logger.error("Error fetching post", e);
//         res.status(500).json({
//           success: false,
//           message: "Error fetching post by ID",
//         });
//       }
// }

const deleteComment = async (req, res) => {
    logger.info("Delete comment endpoint hit");
    try{
        const commentId = req.params.id
        const userId = req.user.userId;

        const comment = await Comment.findById(commentId);
        if(!comment) {  
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }
        if(comment.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to delete this comment"
            });
        }

        // const postId = comment.postId;
        // await comment.deleteOne()

        // await Post.findBy
        const deletedComment = await Comment.findByIdAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if(!deletedComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found or you do not have permission to delete this comment"
            });
        }

        // Publish comment delete method
        // await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });

        // const cacheKey = `post:${postId}`;
        // await req.redisClient.del(cacheKey);

        // Optional: Publish RabbitMQ event
        await publishEvent('comment.deleted', { 
            postId: comment.postId,
            commentId: comment._id,
            userId: comment.user
        });

        await invalidateCommentCache(req, req.params.id)
        logger.info("Comment deleted successfully", deletedComment);

        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch(e) {
        logger.error('Error fetching media', e)
        res.status(500).json({
            success: false,
            message: 'Error Fetching medias'
        })
    }
}
module.exports = {
  createComment,
  getAllPostComments,
  // getUserPostComment,
  deleteComment
};

