import express from "express";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";
import AuthController from "../../../controllers/auth.controller.js";

const router = express.Router();

router.get("/getCarromUser", AuthController.getCarromUser);
router.post("/changeBlockStatus/:userId", AuthController.blockUser);
router.post("/sign-up", [validate(Validation.auth.signUp)], AuthController.signUp);
router.post("/sign-in", [validate(Validation.auth.signIn)], AuthController.signIn);

router.post("/admin-signIn", [validate(Validation.auth.signIn)], AuthController.superAdminSignIn);

const authRoutes = router;

export default authRoutes;
