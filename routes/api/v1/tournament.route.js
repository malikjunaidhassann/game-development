import express from "express";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";
import authorize from "../../../middlewares/authorize.middleware.js";
import TableController from "../../../controllers/tournament.controller.js";

const router = express.Router();

// router.get("/getTournament", TableController.getAllTable);
router.get("/getTournamentStats/:tournamentId", [authorize()], TableController.getTournamentResults);
router.post("/createTournament", [authorize()], TableController.createTournament);

const tournamentRoutes = router;

export default tournamentRoutes;
