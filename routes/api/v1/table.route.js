import express from "express";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";
import TableController from "../../../controllers/table.controller.js";

const router = express.Router();

router.get("/getTable", TableController.getAllTable);
router.post("/createTable", [validate(Validation.table.create)], TableController.createTable);
router.patch("/editTable/:tableId", TableController.editTable);
router.patch("/inActiveTable/:tableId", TableController.inActiveTable);

const tableRoutes = router;

export default tableRoutes;
