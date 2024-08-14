import GameHistory from "../models/gameHistory.model.js";
import { Tournament, TournamentResult } from "../models/table.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

const TournamentController = {
  async getTournaments(_, res) {
    const tournament = await Tournament.find();

    return res.status(200).json({
      success: true,
      data: tournament,
    });
  },
  async createTournament(req, res) {
    const { name, startDate, endDate, gameType, firstPrice, secondPrice, thirdPrice, otherTopTenPrice } =
      req.body;

    let createdTournament = await Tournament.create({
      name,
      gameType,
      startDate,
      endDate,
      firstPrice,
      secondPrice,
      thirdPrice,
      otherTopTenPrice,
    });

    const populatedTournament = await Tournament.findById(createdTournament._id);

    return res.status(201).json({
      success: true,
      data: populatedTournament,
    });
  },
  async editTournament(req, res) {
    const { id } = req.params;
    const { name, startDate, endDate, gameType, firstPrice, secondPrice, thirdPrice, otherTopTenPrice } =
      req.body;
    const date = new Date();
    const endDateComp = new Date(endDate);

    try {
      console.log(date < endDateComp);
      const data =
        date < endDateComp
          ? {
              name,
              gameType,
              startDate,
              endDate,
              firstPrice,
              secondPrice,
              thirdPrice,
              otherTopTenPrice,
              isExpired: false,
            }
          : {
              name,
              gameType,
              startDate,
              endDate,
              firstPrice,
              secondPrice,
              thirdPrice,
              otherTopTenPrice,
              isExpired: true,
            };
      const updatedTournament = await Tournament.findByIdAndUpdate(id, data, { new: true });

      if (!updatedTournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedTournament,
      });
    } catch (error) {
      console.error("Error updating tournament:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
  async endTournament(req, res) {
    const { id } = req.params;
    const date = new Date();
    try {
      const updatedTournament = await Tournament.findByIdAndUpdate(
        id,
        {
          endDate: date,
          isExpired: true,
        },
        { new: true }
      );

      if (!updatedTournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found",
        });
      }

      const results = await GameHistory.aggregate([
        {
          $match: {
            gameType: updatedTournament.gameType,
            createdAt: {
              $gte: new Date(updatedTournament.startDate),
              $lte: new Date(updatedTournament.endDate),
            },
            "gameResult.status": "win",
          },
        },
        {
          $group: {
            _id: "$userId",
            wins: { $sum: 1 },
            totalEarnings: { $sum: { $toDouble: "$gameResult.coins" } }, // Sum up the earnings
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true, // Keeps documents even if user is not found
          },
        },
        {
          $sort: { wins: -1 },
        },
        {
          $limit: 10,
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            user: {
              name: "$user.userName",
            },
            wins: 1,
            totalEarnings: 1,
          },
        },
      ]);

      const tournamentResult = {
        tournamentId: updatedTournament._id,
        tournamentName: updatedTournament.name,
        results: results.map((result, index) => {
          let prize = 0;
          if (index === 0) {
            prize = updatedTournament.firstPrice;
          } else if (index === 1) {
            prize = updatedTournament.secondPrice;
          } else if (index === 2) {
            prize = updatedTournament.thirdPrice;
          } else {
            prize = updatedTournament.otherTopTenPrice;
          }

          return {
            userId: result.userId,
            userName: result.user.name,
            rank: index + 1,
            prize: prize,
            wins: result.wins,
            totalEarnings: result.totalEarnings,
          };
        }),
      };

      const savedTournamentResult = await TournamentResult.create(tournamentResult);

      return res.status(200).json({
        success: true,
        data: updatedTournament,
      });
    } catch (error) {
      console.error("Error updating tournament:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
  async getTournamentResults(req, res) {
    try {
      const { gamePlay } = req.params;

      const tournament = await Tournament.findOne({ gameType: gamePlay });
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      const { startDate, endDate, gameType } = tournament;
      console.log(tournament);

      const results = await GameHistory.aggregate([
        {
          $match: {
            gameType: gameType,
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            "gameResult.status": "win",
          },
        },
        {
          $group: {
            _id: "$userId",
            wins: { $sum: 1 },
            totalEarnings: { $sum: { $toDouble: "$gameResult.coins" } }, // Sum up the earnings
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true, // Keeps documents even if user is not found
          },
        },
        {
          $sort: { wins: -1 },
        },
        {
          $limit: 10,
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            user: {
              name: "$user.userName",
            },
            wins: 1,
            totalEarnings: 1,
          },
        },
      ]);

      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  async getAllTournamentWinnings(req, res) {
    const tournamentResults = await TournamentResult.find();

    res.status(200).json({
      success: true,
      data: tournamentResults,
    });
  },
  async getAllTournamentWinningById(req, res) {
    const { id } = req.params;
    const tournamentResult = await TournamentResult.findById(id);
    if (!tournamentResult) {
      res.status(404).json({
        success: false,
        message: "Tournament result not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tournamentRsesult,
    });
  },
  async addTournamentWinning(req, res) {
    const { id } = req.params;
    try {
      const tournamentResult = await TournamentResult.findById(id);

      if (!tournamentResult) {
        throw new Error("TournamentResult not found");
      }
      if (tournamentResult.paid) {
        res.status(202).json({ message: "Amount Already Paid to the user" });
      }

      for (const result of tournamentResult.results) {
        const user = await User.findById(result.userId);

        if (user) {
          const currentCoins = parseFloat(user.coins) || 0;
          const prizeAmount = result.prize;

          user.coins = (currentCoins + prizeAmount).toString();

          await user.save();
        }
      }
      const tournament = await TournamentResult.findByIdAndUpdate(
        id,
        {
          paid: true,
        },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Winnings successfully added to users' accounts.", data: tournament });
    } catch (error) {
      console.error("Error adding winnings to users:", error);
      throw error;
    }
  },
};

export default TournamentController;
