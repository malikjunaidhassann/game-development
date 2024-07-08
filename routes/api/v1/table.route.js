import express from "express";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";
import TableController from "../../../controllers/table.controller.js";

const router = express.Router();

router.get("/getTable", TableController.getAllTable);
router.post("/createTable", [validate(Validation.auth.signUp)], TableController.createTable);
router.post("/editTable", [validate(Validation.auth.signUp)], TableController);
router.post("/inActiveTable", [validate(Validation.auth.signIn)], TableController);

router.post("/admin-signIn", [validate(Validation.auth.signIn)], TableController);

const tableRoutes = router;

export default tableRoutes;
