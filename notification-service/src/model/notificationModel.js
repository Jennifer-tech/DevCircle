const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { 
      type: String, 
      required: true,
      enum: ['mention', 'comment', 'like', 'follow', 'share'] 
    },
    message: { 
      type: String, 
      required: true 
    },
    metadata: { 
      type: Object,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
