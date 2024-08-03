import express from "express";
import PaymentController from "../../../controllers/payment.controller.js";
import authorize from "../../../middlewares/authorize.middleware.js";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
  "/get-intent",
  [authorize(), validate(Validation.payment.createPayment)],
  PaymentController.getPaymentIntent
);

router.post(
  "/update-status",
  [authorize(), validate(Validation.payment.updateStatus)],
  PaymentController.updateStatus
);

router.get("/get-withdraw-requests", PaymentController.getWithdrawRequests);

router.post(
  "/withdraw-request",
  [authorize(), validate(Validation.payment.withdrawRequest)],
  PaymentController.withdrawRequest
);

router.post(
  "/withdraw-approve/:userId",
  [validate(Validation.payment.withdrawApprove)],
  PaymentController.withdrawApprove
);
const paymentRoutes = router;

export default paymentRoutes;
