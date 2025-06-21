const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    mediaIds: [
        {
            type: String
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "postLike"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true})

// index is being created on content as this enables easy searching
// this part is necessary because we will be having a different service for search
postSchema.index({content: 'text'})

const Post = mongoose.model('Post', postSchema)

module.exports = Post