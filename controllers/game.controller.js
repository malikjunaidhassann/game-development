import GameHistory from "../models/gameHistory.model.js";
import User from "../models/user.model.js";

const GameController = {
  async startGame(req, res) {
    const { _id: userId } = req.user;
    const { tableId, gameCoins } = req.bodyValue;

    const user = await User.findOne({ _id: userId, isBlocked: false });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found!",
      });
    }

    if (user.coins < gameCoins) {
      return res.status(404).json({
        success: false,
        message: "User do not have enough coins!",
      });
    }

    const game = await GameHistory.create({
      userId,
      tableId,
      gameCoins,
      gameStatus: "in-progress",
    });

    const coinsNow = user.coins - gameCoins;

    user.coins = coinsNow;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Game Started successfully!",
      game,
      user,
    });
  },

  async updateGameStatus(req, res) {
    const { _id: userId } = req.user;
    const { gameId, gameStatus, gameResult } = req.bodyValue;

    const user = await User.findOne({ _id: userId, isBlocked: false });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found!",
      });
    }

    const game = await GameHistory.findByIdAndUpdate(
      {
        _id: gameId,
        userId,
      },
      {
        gameStatus,
        gameResult,
      },
      { new: true }
    );

    if (gameResult.status === "win") {
      user.coins = Number(user.coins) + Number(gameResult.coins);
      await user.save();
    }

    return res.status(201).json({
      success: true,
      message: "Game Status Updated successfully!",
      game,
      user,
    });
  },
};

export default GameController;
