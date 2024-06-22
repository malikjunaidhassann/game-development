import express from "express";
import authRoutes from "./v1/auth.route.js";

const router = express.Router();

router.use("/auth", authRoutes);

const v1Routes = router;

export default v1Routes;
