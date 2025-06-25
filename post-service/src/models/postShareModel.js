const mongoose = require('mongoose');
const postShareSchema = new mongoose.Schema({
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
const PostShare = mongoose.model('PostShare', postShareSchema);
module.exports = PostShare;
