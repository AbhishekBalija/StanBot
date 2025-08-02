import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', null],
      default: null,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    embedding: {
      type: [Number],
      default: null,
      select: false, // Don't return by default in queries
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for basic search
messageSchema.index({ content: 'text' });

export const Message = mongoose.model('Message', messageSchema);