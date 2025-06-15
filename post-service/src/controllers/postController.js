const logger = require("../utils/logger")

const createPost = async (req, res) => {
    try{
        const {content, mediaIds} = req.body
        const newlyCreatedPost = new Post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || []
        })

        await newlyCreatedPost.save()
        logger.info('Post created successfully', newlyCreatedPost)
        res.status(201).json({
            success: true,
            message: "Post created successfully"
        })
    } catch(e){
        logger.error("Error creating post", e);
        res.status(500).json({
            success: false,
            message: "Error creating post"
        })
    }
}

const getAllPosts = async (req, res) => {
    try{

    } catch(e){
        logger.error("Error fetching posts", e);
        res.status(500).json({
            success: false,
            message: "Error fetching posts"
        })
    }
}

const getPost = async (req, res) => {
    try{

    } catch(e){
        logger.error("Error fetching post", e);
        res.status(500).json({
            success: false,
            message: "Error fetching post by ID"
        })
    }
}

const deletePost = async (req, res) => {
    try{

    } catch(e){
        logger.error("Error deleting post", e);
        res.status(500).json({
            success: false,
            message: "Error deleting post"
        })
    }
}
module.exports = {createPost}