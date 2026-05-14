const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");

const router = express.Router();

router.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const toUserId = req.params.targetUserId;

    let chat = await Chat.findOne({
      participants: {
        $all: [currentUserId, toUserId],
      },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName photoUrl",
    });

    if (!chat) {
      chat = new Chat({
        participants: [currentUserId, toUserId],
        messages: [],
      });

      await chat.save();
      return res.status(400).send({
        message: "No chats found",
      });
    }

    res.status(200).send({
      data: chat.messages,
    });
  } catch (error) {
    res.status(400).send("Error: " + error);
  }
});

module.exports = router;
