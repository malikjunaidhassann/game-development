import express from "express";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";
import authorize from "../../../middlewares/authorize.middleware.js";
import TableController from "../../../controllers/tournament.controller.js";

const router = express.Router();

router.get("/getTournaments", TableController.getTournaments);
router.get("/getTournamentWinning", TableController.getAllTournamentWinnings);
router.get("/getTournamentWinning/:id", TableController.getAllTournamentWinnings);
router.get("/getTournamentStats/:gamePlay", [authorize()], TableController.getTournamentResults);
router.post("/createTournament", TableController.createTournament);
router.patch("/editTournament/:id", TableController.editTournament);
router.patch("/endTournament/:id", TableController.endTournament);
router.post("/addTournamentWinnings/:id", TableController.addTournamentWinning);

const tournamentRoutes = router;

export default tournamentRoutes;
