import express from "express";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";
import AuthController from "../../../controllers/auth.controller.js";
import s3Service from "../../../services/s3Service.js";
import authorize from "../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.get("/getCarromUser", AuthController.getCarromUser);
router.post("/changeBlockStatus/:userId", AuthController.blockUser);
router.post(
  "/sign-up",
  [s3Service.uploadS3({}).single("profile-image"), validate(Validation.auth.signUp)],
  AuthController.signUp
);

router.post(
  "/verify-email",
  [authorize(), validate(Validation.auth.verifyEmail)],
  AuthController.verifyEmail
);

router.post("/sign-in", [validate(Validation.auth.signIn)], AuthController.signIn);
router.post("/google-sign-in", [validate(Validation.auth.googleSignUp)], AuthController.googleSignIn);

router.post("/forgot-password", [validate(Validation.auth.forgotPassword)], AuthController.forgotPassword);
router.post("/reset-password", [validate(Validation.auth.resetPassword)], AuthController.resetPassword);

router.post("/admin-signIn", [validate(Validation.auth.signIn)], AuthController.superAdminSignIn);

router.get("/get-user-stats", [authorize()], AuthController.getUserStats);

const authRoutes = router;

export default authRoutes;
