import express from "express";
import Validation from "../../../validations/validation.js";
import validate from "../../../middlewares/validate.middleware.js";
import AuthController from "../../../controllers/auth.controller.js";
import s3Service from "../../../services/s3Service.js";
import authorize from "../../../middlewares/authorize.middleware.js";
import FriendController from "../../../controllers/friend.controller.js";

const router = express.Router();

router.get("/recieved-request", [authorize()], FriendController.getReceivedFriendRequests);
router.post("/send-request", [authorize()], FriendController.sendFriendRequest);
router.post("/accept-request", [authorize()], FriendController.acceptFriendRequest);

router.get("/get-friends", [authorize()], FriendController.getFriends);

const friendRoutes = router;

export default friendRoutes;
