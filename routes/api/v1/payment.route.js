import express from "express";
import PaymentController from "../../../controllers/payment.controller.js";
import authorize from "../../../middlewares/authorize.middleware.js";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
  "/get-intent",
  [authorize, validate(Validation.payment.createPayment)],
  PaymentController.getPaymentIntent
);

router.post(
  "/update-status",
  [authorize, validate(Validation.payment.updateStatus)],
  PaymentController.updateStatus
);

const paymentRoutes = router;

export default paymentRoutes;
