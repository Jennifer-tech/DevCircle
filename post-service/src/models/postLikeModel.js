const mongoose = require('mongoose');
const postLikeSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
postLikeSchema.index({postId: 1, userId: 1}, { unique: true});
const PostLike = mongoose.model('PostLike', postLikeSchema);
module.exports = PostLike;
