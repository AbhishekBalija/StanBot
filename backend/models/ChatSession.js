import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null, // For anonymous sessions
    },
    lastActive: {
      type: Date,
      required: true,
      default: Date.now,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    preferences: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Add method to update session metadata
chatSessionSchema.methods.updateMetadata = async function (key, value) {
  if (!this.metadata) {
    this.metadata = new Map();
  }
  this.metadata.set(key, value);
  return this.save();
};

// Add method to get recent messages
chatSessionSchema.methods.getRecentMessages = async function (limit = 10) {
  const Message = mongoose.model('Message');
  return Message.find({ sessionId: this._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .sort({ createdAt: 1 });
};

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);