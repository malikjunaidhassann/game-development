import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import bKashService from "../services/bKashService.js";

const PaymentController = {
  async getPaymentIntent(req, res) {
    const { _id: userId } = req.user;
    const { amount } = req.bodyValue;

    const [getToken, errorToken] = await bKashService.getAccessToken();

    const [createPayment, errorPayment] = await bKashService.createPayment({
      token: getToken?.id_token,
      userId,
      amount,
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
    console.log({ createPayment });

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
      user.coins = payment.amount;
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
};

export default PaymentController;
