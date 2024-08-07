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
  },
  { timestamps: true }
);

const Tournament = mongoose.model("Tournament", tournamentSchema);

TableSchema.plugin(autoIncrement, { inc_field: "tableNo" });

const Table = mongoose.model("Table", TableSchema);

export { Table, Tournament };
