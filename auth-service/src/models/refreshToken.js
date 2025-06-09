const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true});

refreshTokenSchema.index({ expiresAt: 1}, {expiresAfterSeconds: 0});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken