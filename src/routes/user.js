const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { USER_SAFE_DATA } = require("../constants");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const router = express.Router();

router.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const pendingRequests = await ConnectionRequest.find({
      toUserId: loggedInUserId,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    //   .populate("fromUserId", ["firstName", "lastName"]);

    res.status(200).json({
      data: pendingRequests,
    });
  } catch (error) {
    res.status(400).send("Error: ", error.message);
  }
});

router.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const connections = await ConnectionRequest.find({
      $or: [
        {
          fromUserId: loggedInUserId,
          status: "accepted",
        },
        {
          toUserId: loggedInUserId,
          status: "accepted",
        },
      ],
    }).populate(["fromUserId", "toUserId"], USER_SAFE_DATA);

    const data = connections.map((row) => {
      if (row.fromUserId._id.equals(loggedInUserId)) {
        return row.toUserId;
      }

      return row.fromUserId;
    });

    res.status(200).json({
      data,
    });
  } catch (error) {
    res.status(400).send("Error " + error.message);
  }
});

router.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id.toString();
    const page = Math.max(parseInt(req.query.page), 0) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // 1. Get all connection requests involving logged-in user
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUserId }, { toUserId: loggedInUserId }],
    });

    // 2. Extract all user IDs to exclude
    const excludeUserIds = connectionRequests.map((row) => {
      const fromId = row.fromUserId.toString();
      const toId = row.toUserId.toString();

      return fromId === loggedInUserId ? toId : fromId;
    });

    // 3. Also exclude logged-in user
    excludeUserIds.push(loggedInUserId);

    // 4. Remove duplicates
    const uniqueExcludeUserIds = [...new Set(excludeUserIds)];

    // 5. Fetch all users except excluded ones
    const users = await User.find({
      _id: { $nin: uniqueExcludeUserIds },
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({
      _id: {
        $nin: uniqueExcludeUserIds,
      },
    });

    res.status(200).json({
      total: totalUsers,
      page,
      limit,
      data: users,
    });
  } catch (error) {
    res.status(400).send("Error ", error);
  }
});

router.get("/user/premium/verify", userAuth, async (req, res) => {
  const user = req.user;

  return res.status(200).send({
    data: {
      isPremium: user.isPremium ? true : false,
    },
  });
});

module.exports = router;
