import GameHistory from "../models/gameHistory.model.js";
import { Tournament } from "../models/table.model.js";
import mongoose from "mongoose";

const TableController = {
  async getAllTable(_, res) {
    const table = await Tournament.find();

    return res.status(200).json({
      success: true,
      data: table,
    });
  },
  async createTournament(req, res) {
    const { name, startDate, endDate, tableId } = req.body;

    const createdTornament = await Tournament.create({
      name,
      tableId,
      startDate,
      endDate,
    });
    return res.status(201).json({
      success: true,
      data: createdTornament,
    });
  },
  async getTournamentResults(req, res) {
    try {
      const { tournamentId } = req.params;

      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      const { startDate, endDate, tableId } = tournament;
      const tableeId = new mongoose.Types.ObjectId(tableId);

      // Use aggregation pipeline to process the game histories
      const results = await GameHistory.aggregate([
        {
          $match: {
            tableId: tableeId,
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
              name: "$user.userName", // Adjust field name according to your schema
            },
            wins: 1,
            totalEarnings: 1, // Include total earnings in the result
          },
        },
      ]);

      console.log(results); // Log results for debugging
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default TableController;
