import express from "express";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";
import TableController from "../../../controllers/table.controller.js";
import s3Service from "../../../services/s3Service.js";

const router = express.Router();


router.get("/getTable", TableController.getAllTable);
router.post(
  "/createTable",
  [s3Service.uploadS3({}).single("table-image"), validate(Validation.table.create)],
  TableController.createTable
);
router.patch(
  "/editTable/:tableId",
  [s3Service.uploadS3({}).single("table-image"), validate(Validation.table.create)],
  TableController.editTable
);
router.patch("/inActiveTable/:tableId", TableController.inActiveTable);

const tableRoutes = router;

export default tableRoutes;
