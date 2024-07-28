import express from "express";
import authRoutes from "./v1/auth.route.js";
import tableRoutes from "./v1/table.route.js";
import paymentRoutes from "./v1/payment.route.js";
import gameRoutes from "./v1/game.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/table", tableRoutes);
router.use("/payment", paymentRoutes);
router.use("/game", gameRoutes);

const v1Routes = router;

export default v1Routes;
