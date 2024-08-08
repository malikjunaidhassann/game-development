import GameHistory from "../models/gameHistory.model.js";
import { Tournament } from "../models/table.model.js";
import mongoose from "mongoose";

const TournamentController = {
  async getTournaments(_, res) {
    const tournament = await Tournament.find().populate("tableId");

    return res.status(200).json({
      success: true,
      data: tournament,
    });
  },
  async createTournament(req, res) {
    const { name, startDate, endDate, gameType } = req.body;

    let createdTournament = await Tournament.create({
      name,
      gameType,
      startDate,
      endDate,
    });

    const populatedTournament = await Tournament.findById(createdTournament._id);

    return res.status(201).json({
      success: true,
      data: populatedTournament,
    });
  },
  async getTournamentResults(req, res) {
    try {
      const { gamePlay } = req.params;
      console.log({ gamePlay });

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
};

export default TournamentController;
