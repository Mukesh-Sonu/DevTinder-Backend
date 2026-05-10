const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {
  validateUserProfileData,
  encryptPassword,
} = require("../utils/validation");
const User = require("../models/user");

const router = express.Router();

router.get("/profile/view", userAuth, (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send("Error: " + error);
  }
});

router.patch("/profile/edit", userAuth, async (req, res) => {
  const userId = req.user._id;
  try {
    if (!validateUserProfileData(req)) {
      throw new Error("Invalid Edit request");
    }

    const loggedInUser = {};

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    const user = await User.findByIdAndUpdate(userId, loggedInUser, {
      returnDocument: "after",
      runValidators: true,
    });

    res.status(200).json({
      message: `${user.firstName}, your profile updated successfully`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("Error saving the user in the DB" + error.message);
  }
});

router.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { password } = req.body;

    // Encrypt password
    const passwordHash = await encryptPassword(password);

    // store in db
    await User.findByIdAndUpdate(req.user._id, {
      password: passwordHash,
    });

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = router;
