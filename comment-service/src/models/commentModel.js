const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    // mentions: [String],
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
}, {timestamps: true})

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment