const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    postId: {
        type: String,
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
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    mentions: [String],
}, {timestamps: true})

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment