import express from "express";
import v1Routes from "./api/v1.routes.js";

const router = express.Router();

router.use("/v1", v1Routes);

const apiRoutes = router;

export default apiRoutes;
