const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    //handle events
    socket.on("joinChat", ({ userId, targetUserId }) => {
      // const roomId = [userId, targetUserId].sort().join("_");

      //   Hashed roomId
      const roomId = getSecretRoomId(userId, targetUserId);

      // We are sorting to make sure two person join the same room
      // console.log(firstName + " joined room : " + roomId);
      // Mukesh joined room : 6a00694afab696fb4561ee1a_6a006976fab696fb4561ee1c
      // Mohan joined room : 6a00694afab696fb4561ee1a_6a006976fab696fb4561ee1c

      console.log("JOIN CHAT", roomId);
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ userId, targetUserId, text }) => {
      try {
        const roomId = getSecretRoomId(userId, targetUserId);

        const areUsersFriends = await ConnectionRequest.findOne({
          $or: [
            { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
            { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
          ],
        });

        if (!areUsersFriends) {
          //   return res.status(400).send("Invalid message request");
          throw new Error("Invalid message request");
        }

        let chat = await Chat.findOne({
          participants: {
            $all: [userId, targetUserId],
          },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text,
        });

        await chat.save();

        // populate sender of latest message
        await chat.populate({
          path: "messages.senderId",
          select: "firstName lastName photoUrl",
        });

        const latestMessage = chat.messages[chat.messages.length - 1];

        io.to(roomId).emit("messageReceived", {
          text: latestMessage.text,
          senderId: latestMessage.senderId,
          id: latestMessage._id,
        });
      } catch (error) {
        console.log(error);
      }
    });
  });
};

module.exports = initializeSocket;
