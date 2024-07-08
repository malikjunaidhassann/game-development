import mongoose from "mongoose";
import autoIncrement from "mongoose-sequence";

const TableSchema = new mongoose.Schema(
  {
    tableNo: {
      type: Number,
      unique: true,
    },
    tableName: {
      type: String,
      unique: true,
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

TableSchema.plugin(autoIncrement, { inc_field: "tableNo" });

const Table = mongoose.model("Table", TableSchema);

export default Table;
