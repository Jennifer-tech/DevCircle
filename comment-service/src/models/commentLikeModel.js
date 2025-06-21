const mongoose = require('mongoose');

const commentLikeSchema = new mongoose.Schema({
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
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
commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });
const CommentLike = mongoose.model('CommentLike', commentLikeSchema);
module.exports = CommentLike;

