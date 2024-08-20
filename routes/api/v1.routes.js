import express from "express";
import authRoutes from "./v1/auth.route.js";
import tableRoutes from "./v1/table.route.js";
import paymentRoutes from "./v1/payment.route.js";
import gameRoutes from "./v1/game.route.js";
import tournamentRoutes from "./v1/tournament.route.js";
import friendRoutes from "./v1/friend.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/table", tableRoutes);
router.use("/tournament", tournamentRoutes);
router.use("/payment", paymentRoutes);
router.use("/game", gameRoutes);
router.use("/friend", friendRoutes);

const v1Routes = router;

export default v1Routes;
