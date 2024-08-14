import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    paymentID: {
      type: String,
      required: true,
      // unique: true,
    },
    amount: {
      type: String,
      required: true,
    },
    intent: {
      type: String,
      required: true,
    },
    currency: {
      default: "BDT",
      type: String,
      required: true,
    },
    paymentCreateTime: {
      type: String,
    },
    transactionStatus: {
      type: String,
      enum: ["Initiated", "success", "failure", "cancel"],
    },
    merchantInvoiceNumber: {
      type: String,
    },
    statusCode: {
      type: String,
    },
    statusMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("payment", paymentSchema);

export default Payment;
