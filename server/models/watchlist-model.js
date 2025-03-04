const { Schema, mongoose } = require("mongoose");

const WatchlistSchema = new Schema({
  userId: { type: String, required: true, unique: true }, // Unique User ID
  movieIds: { type: [String], default: [] }, // Movie IDs Array
  addedAt: { type: Date, default: Date.now },
});


const Watchlist =  new mongoose.model("Watchlist",WatchlistSchema)
module.exports = Watchlist;
