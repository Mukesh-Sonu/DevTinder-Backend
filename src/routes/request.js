const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const router = express.Router();

// This API is only for interested or ignored
router.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const toUser = await User.findById(toUserId);

    if (!toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const ALLOWED_STATUS = ["ignored", "interested"];

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status type " + status });
    }

    // check if already interest request is sent from A -> B

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnectionRequest) {
      return res.status(400).json({
        message: "A Request Already Exists",
      });
    }

    // A -> B

    // check if already B sent connection to A

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();

    const dynamicMessage =
      status === "interested"
        ? `${req.user.firstName} is ${status} in ${toUser.firstName}`
        : `${req.user.firstName} ${status} ${toUser.firstName}`;

    res.status(200).json({
      message: dynamicMessage,
      data,
    });
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

router.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      const { requestId, status } = req.params;

      // first validate the status
      const ALLOWED_STATUS = ["accepted", "rejected"];

      if (!ALLOWED_STATUS.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type " + status });
      }

      // find the connectioncheck if the logged in user in the toUserId to accept or reject
      // if connection found updated the status to accepted/rejected only if interested
      // if no connection then error: No connection request to accept / reject

      const connectRequest = await ConnectionRequest.findOneAndUpdate(
        {
          toUserId: loggedInUserId,
          fromUserId: requestId,
          status: "interested", // update only if current status is interested
        },
        { $set: { status } },
        {
          new: true, // returns the updated document or (returnDocument: "after",) both works
          runValidators: true,
        }
      );

      if (!connectRequest) {
        return res
          .status(404)
          .send("No pending connection request found to accept or reject");
      }

      res.status(200).json({
        message: `Request ${status} successfully`,
        data: connectRequest,
      });
    } catch (error) {
      res.status(400).send("Error: " + error.message);
    }
  }
);

module.exports = router;
