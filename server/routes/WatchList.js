const express = require('express');
const router = express.Router();
const Watchlist = require('../models/watchlist-model'); // 

router.post('/addtowatchlist', async (req, res) => {
    try {
        const { userId, movieId } = req.body;

        if (!userId || !movieId) {
            return res.status(400).json({ error: "Missing required fields", success: false });
        }

        // Check if movie already exists in the watchlist
        const Existence = await Watchlist.findOne({
            userId,
            movieIds: movieId, // Check if movieId is already in the array
        });

        if (Existence) {
            return res.json({ message: "Movie already in watchlist!", Existence: true, success: true });
        }

        // Add movie to watchlist if not already present
        const updatedWatchlist = await Watchlist.findOneAndUpdate(
            { userId },
            { $addToSet: { movieIds: movieId } }, // Prevents duplicate movieId
            { upsert: true, new: true } // Creates entry if not exists
        );

        res.json({ message: "✅ Movie added to watchlist!", Existence: false, updatedWatchlist, success: true });

    } catch (error) {
        console.error("❌ Error adding to watchlist:", error);
        res.status(500).json({ error: "Internal Server Error", success: false });
    }
});



// 📜 **Get User's Watchlist**
router.get("/watchlist/:userId", async (req, res) => {
    try {
        const {userId} = req.params;
        const watchlist = await Watchlist.findOne({ userId });
        if (!watchlist) return res.json({ message: "No watchlist found." });

        res.json(watchlist);
    } catch (error) {
        console.error("❌ Error fetching watchlist:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🚫 **Remove Movie from Watchlist**
router.post("/remove-from-watchlist", async (req, res) => {
    try {
        const { userId, movieId } = req.body;

        if (!userId || !movieId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const updatedWatchlist = await Watchlist.findOneAndUpdate(
            { userId },
            { $pull: { movieIds: movieId } }, // ✅ Removes specific movieId
            { new: true }
        );

        res.json({ message: "✅ Movie removed from watchlist!", updatedWatchlist });
    } catch (error) {
        console.error("❌ Error removing from watchlist:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router