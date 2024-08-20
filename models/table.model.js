import mongoose from "mongoose";
import autoIncrementFactory from "mongoose-sequence";

const autoIncrement = autoIncrementFactory(mongoose);

const TableSchema = new mongoose.Schema(
  {
    tableNo: {
      type: Number,
      unique: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    entryFee: {
      type: Number,
      required: true,
    },
    reward: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.entryFee;
        },
        message: "Reward must be greater than or equal to the entry fee.",
      },
    },
    image: {
      type: String,
      required: true,
    },
    inactive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gameType: {
      type: String,
      enum: ["firstDiscoPool", "playCarrom", "freeStyle"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    firstPrice: {
      type: Number,
      required: true,
    },
    secondPrice: {
      type: Number,
      required: true,
    },
    thirdPrice: {
      type: Number,
      required: true,
    },
    otherTopTenPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const tournamentResultSchema = new mongoose.Schema(
  {
    tournamentName: {
      type: String,
      required: true,
    },
    tournamentId: {
      type: String,
      ref: "Tournament",
      required: true,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    results: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        rank: {
          type: Number,
          required: true,
        },
        prize: {
          type: Number,
          required: true,
        },
        wins: {
          type: Number,
          required: true,
        },
        totalEarnings: {
          type: Number,
          required: true,
        },
        gameType: {
          type: String,
          enum: ["firstDiscoPool", "playCarrom", "freeStyle"],
        },
      },
    ],
  },
  { timestamps: true }
);

const TournamentResult = mongoose.model("TournamentResult", tournamentResultSchema);

const Tournament = mongoose.model("Tournament", tournamentSchema);

TableSchema.plugin(autoIncrement, { inc_field: "tableNo" });

const Table = mongoose.model("Table", TableSchema);

export { Table, Tournament, TournamentResult };
