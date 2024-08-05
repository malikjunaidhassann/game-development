import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    walletId: {
      type: String,
      required: true,
    },
    accountHolder: {
      type: String,
      required: true,
    },
    intent: {
      type: String,
      default: "withdraw",
    },
    currency: {
      default: "BDT",
      type: String,
    },
    withdrawRequestTime: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    transactionStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
    },
    statusMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

const Withdraw = mongoose.model("withdraw", withdrawSchema);

export default Withdraw;
