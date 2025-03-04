const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    query: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    metadata: {
        type: {
            type: String,
            enum: ['analytics', 'database', 'user_management', 'movie_management'],
            required: true
        },
        action: String,
        success: Boolean
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
chatbotSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ChatbotInteraction', chatbotSchema);