const Post = require("../models/postModel");
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitmq");
const { validateCreatePost } = require("../utils/validation");

async function invalidatePostCache(req, input) {
    const cacheKey = `post:${input}`;
    await req.redisClient.del(cacheKey)
    const keys = await req.redisClient.keys("posts:*")
    if(keys.length > 0) {
        await req.redisClient.del(keys)
    }
}

const createPost = async (req, res) => {
    logger.info("Create post endpoint hit")
  try {
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();
    await publishEvent('post.created', {
      postId: newlyCreatedPost._id.toString(),
      userId: newlyCreatedPost.user.toString(),
      content: newlyCreatedPost.content,
      createdAt: newlyCreatedPost.createdAt,
    })

    await invalidatePostCache(req, newlyCreatedPost._id.toString())
    logger.info("Post created successfully", newlyCreatedPost);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (e) {
    logger.error("Error creating post", e);
    res.status(500).json({
      success: false,
      message: "Error creating post",
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);

    if(cachedPosts) {
        return res.json(JSON.parse(cachedPosts));
    }

    const posts = await Post.find({}).sort({ createdAt: -1}).skip(startIndex).limit(limit)

    const totalNoOfPosts = await Post.countDocuments();

    const result = {
        posts,
        currentPage: page,
        totalPages: Math.ceil(totalNoOfPosts / limit),
        totalPosts: totalNoOfPosts
    }

    // save your posts in redis cache
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result))

    res.json(result)
  } catch (e) {
    logger.error("Error fetching posts", e);
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const cachekey = `post: ${postId}`
    const cachedPost = await req.redisClient.get(cachekey);

    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    const singlePostDetailsById = await Post.findById(postId)
    
    if(!singlePostDetailsById) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    await req.redisClient.setex(cachedPost, 3600, JSON.stringify(singlePostDetailsById))

    res.json(singlePostDetailsById);
  } catch (e) {
    logger.error("Error fetching post", e);
    res.status(500).json({
      success: false,
      message: "Error fetching post by ID",
    });
  }
};

const deletePost = async (req, res) => {
    logger.info("Delete post endpoint hit")

  try {
    const deletedPost = await Post.findByIdAndDelete({
        _id: req.params.id,
        user: req.user.userId
    });
    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Publish post delete method
    await publishEvent("post.deleted", {
      postId: deletedPost._id,
      userId: req.user.userId,
      mediaIds: deletedPost.mediaIds,
    })



    await invalidatePostCache(req, req.params.id)
    logger.info("Post deleted successfully", deletedPost);
    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (e) {
    logger.error("Error deleting post", e);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
    });
  }
};
module.exports = { createPost, getAllPosts, getPost, deletePost };
