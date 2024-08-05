import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import Withdraw from "../models/withdraw.model.js";
import bKashService from "../services/bKashService.js";

const PaymentController = {
  async getPaymentIntent(req, res) {
    const { _id: userId } = req.user;
    const { amount } = req.bodyValue;

    const InvoiceCount = await Payment.countDocuments();

    const [getToken, errorToken] = await bKashService.getAccessToken();

    const [createPayment, errorPayment] = await bKashService.createPayment({
      token: getToken?.id_token,
      userId,
      amount,
      InvoiceCount,
    });

    if (errorToken || errorPayment) {
      if (errorToken) {
        return res.status(400).json({
          success: false,
          message: `Error while getting Token ${errorToken?.message}`,
        });
      }
      if (errorPayment) {
        return res.status(400).json({
          success: false,
          message: `Error while Creating Payment ${errorPayment?.message}`,
        });
      }
    }

    const {
      paymentID,
      intent,
      currency,
      paymentCreateTime,
      transactionStatus,
      merchantInvoiceNumber,
      statusCode,
      statusMessage,
    } = createPayment;

    const payment = await Payment.create({
      userId,
      paymentID,
      amount,
      intent,
      currency,
      paymentCreateTime,
      transactionStatus,
      merchantInvoiceNumber,
      statusCode,
      statusMessage,
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not Created in Database" });
    }

    return res.status(201).json({
      success: true,
      message: "Payment Intent created successfully!",
      redirectURL: createPayment?.bkashURL,
    });
  },

  async updateStatus(req, res) {
    const { _id: userId } = req.user;
    const { status, paymentID } = req.bodyValue;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User Not Found`,
      });
    }

    const payment = await Payment.findOne({ userId, paymentID });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not Found" });
    }

    if (status === "success") {
      user.coins = user.coins + payment.amount;
      await user.save();
    }

    payment.transactionStatus = status;
    await payment.save();

    return res.status(201).json({
      success: true,
      message: "Payment Status Updated successfully!",
      payment,
      user,
    });
  },

  async getWithdrawRequests(req, res) {
    const promises = [
      Withdraw.find({ transactionStatus: "pending" }).exec(),
      Withdraw.find({ transactionStatus: "completed" }).exec(),
      Withdraw.find({ transactionStatus: "cancelled" }).exec(),
    ];

    const [pendingWithdraws, completedWithdraws, cancelledWithdraws] =
      await Promise.all(promises);

    return res.status(200).json({
      pendingWithdraws,
      completedWithdraws,
      cancelledWithdraws,
    });
  },

  async withdrawRequest(req, res) {
    const { _id: userId } = req.user;
    const { amount, walletId, accountHolder } = req.bodyValue;

    const user = await User.findOne({ _id: userId, isBlocked: false });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User Not Found`,
      });
    }

    if (amount > user.coins) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal Amount Exceeds Your Available Balance.",
      });
    }

    const withdraw = await Withdraw.create({
      userId,
      amount,
      walletId,
      accountHolder,
      withdrawRequestTime: new Date(),
      transactionStatus: "pending",
    });

    user.coins = user.coins - amount;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Payment Withdraw Request Created",
      withdraw,
      user,
    });
  },

  async withdrawApprove(req, res) {
    const { userId } = req.params;
    const { withdrawId, transactionId, status } = req.bodyValue;

    const withdraw = await Withdraw.findByIdAndUpdate(
      {
        _id: withdrawId,
        userId,
      },
      {
        transactionId,
        transactionStatus: status,
      },
      { new: true }
    );

    if (!withdraw) {
      return res.status(400).json({
        success: false,
        message: " Withdraw Request not Found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment Sent to User.",
      withdraw,
    });
  },
};

export default PaymentController;
