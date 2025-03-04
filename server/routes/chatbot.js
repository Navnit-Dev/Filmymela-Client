const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const ChatbotInteraction = require('../models/chatbot-model');
const Movie = require('../models/movies-model');
const User = require('../models/user-modal');
const NodeCache = require('node-cache');
const { isAdmin, apiLimiter } = require('../middleware/auth');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Cache for analytics data (30 minutes TTL)
const analyticsCache = new NodeCache({ stdTTL: 1800 });

// Helper function to get analytics data
async function getAnalytics() {
    const cacheKey = 'site_analytics';
    let analytics = analyticsCache.get(cacheKey);
    
    if (!analytics) {
        analytics = {
            totalMovies: await Movie.countDocuments(),
            totalUsers: await User.countDocuments(),
            mostWatched: await Movie.find().sort({ views: -1 }).limit(5),
            mostDownloaded: await Movie.find().sort({ downloads: -1 }).limit(5),
            recentUsers: await User.find().sort({ createdAt: -1 }).limit(5)
        };
        analyticsCache.set(cacheKey, analytics);
    }
    
    return analytics;
}

// Process natural language commands
async function processCommand(command) {
    const analytics = await getAnalytics();
    
    // Create a system message that defines the chatbot's capabilities
    const systemMessage = `You are an AI admin assistant for a movie streaming platform. 
    Current analytics:
    - Total Movies: ${analytics.totalMovies}
    - Total Users: ${analytics.totalUsers}
    - Most Watched Movies: ${analytics.mostWatched.map(m => m.title).join(', ')}
    - Most Downloaded: ${analytics.mostDownloaded.map(m => m.title).join(', ')}
    
    You can help with:
    1. Analytics queries
    2. Database management suggestions
    3. User management insights
    4. Movie management recommendations`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: command }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw new Error('Failed to process command');
    }
}

// Route to handle chatbot interactions
router.post('/chat', [isAdmin, apiLimiter], async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Query is required' });
        }

        // Process the command
        const response = await processCommand(query);

        // Save interaction
        const interaction = new ChatbotInteraction({
            userId: req.user.id,
            query,
            response,
            metadata: {
                type: 'analytics', // Default type, could be made more specific based on query analysis
                success: true
            }
        });
        await interaction.save();

        res.json({
            success: true,
            response,
            interaction: interaction._id
        });

    } catch (error) {
        console.error('Chatbot Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing chatbot request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route to get chat history
router.get('/history', [isAdmin, apiLimiter], async (req, res) => {
    try {
        const history = await ChatbotInteraction.find({ userId: req.user.id })
            .sort({ timestamp: -1 })
            .limit(50);
        
        res.json({
            success: true,
            history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching chat history'
        });
    }
});

module.exports = router;