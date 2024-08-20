import GameHistory from "../models/gameHistory.model.js";
import { User, FriendRequest } from "../models/user.model.js";

const FriendController = {
  async sendFriendRequest(req, res) {
    const { senderId, receiverId } = req.body;
    const existingRequest = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent." });
    }

    const friendRequest = new FriendRequest({ sender: senderId, receiver: receiverId });
    await friendRequest.save();

    res.status(201).json({ message: "Friend request sent." });
  },
  async getReceivedFriendRequests(req, res) {
    const { _id: userId } = req.user;

    const requests = await FriendRequest.find({ receiver: userId, status: "pending" })
      .populate("sender", "userName profile")
      .exec();

    res.status(200).json(requests);
  },
  async getSentFriendRequests(req, res) {
    const { _id: userId } = req.user;
    const requests = await FriendRequest.find({ sender: userId, status: "pending" })
      .populate("receiver", "userName profile")
      .exec();

    res.status(200).json(requests);
  },
  async acceptFriendRequest(req, res) {
    const { requestId } = req.body;
    const request = await FriendRequest.findById(requestId);

    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid friend request." });
    }

    request.status = "accepted";
    await request.save();

    const sender = await User.findById(request.sender);
    const receiver = await User.findById(request.receiver);

    sender.friends.push(receiver._id);
    receiver.friends.push(sender._id);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: "Friend request accepted." });
  },
  async getFriends(req, res) {
    const { _id: userId } = req.user;
    const user = await User.findById(userId).populate("friends", "userName profile").exec();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user.friends);
  },
};

export default FriendController;
