import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    gameType: {
      type: String,
      enum: ["firstDiscoPool", "playCarrom", "freeStyle"],
      required: true,
    },
    gameStatus: {
      type: String,
      enum: ["in-progress", "no-result", "completed"],
    },
    gameCoins: {
      type: String,
    },
    gameResult: {
      status: {
        type: String,
        enum: ["win", "lose"],
      },
      coins: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const GameHistory = mongoose.model("game-history", gameHistorySchema);

export default GameHistory;
