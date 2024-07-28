import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    gameStatus: {
      type: String,
      enum: ["in-progress", "completed"],
    },
    gameCoins: {
      type: String,
    },
    gameResult: {
      status: {
        type: String,
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
