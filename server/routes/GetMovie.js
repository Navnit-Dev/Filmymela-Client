const express = require("express");
const router = express.Router();
const Movie = require("../models/movies-model");

// GET movies by array of IDs
router.post("/get-movies", async (req, res) => {
  try {
    const { movieIds } = req.body; // Expect movie IDs from the request body
    const movies = await Movie.find({ _id: { $in: movieIds } });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movies", error });
  }
});

module.exports = router;
