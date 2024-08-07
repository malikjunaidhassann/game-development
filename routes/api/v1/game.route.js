import express from "express";
import GameController from "../../../controllers/game.controller.js";
import authorize from "../../../middlewares/authorize.middleware.js";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
  "/start",
  [authorize(), validate(Validation.game.startGame)],
  GameController.startGame
);

router.post(
  "/update",
  [authorize(), validate(Validation.game.updateGameStatus)],
  GameController.updateGameStatus
);

const gameRoutes = router;

export default gameRoutes;
