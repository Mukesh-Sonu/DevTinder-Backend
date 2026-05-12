const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {
  validateUserProfileData,
  encryptPassword,
} = require("../utils/validation");
const User = require("../models/user");
const { constructUserData } = require("../utils/user");

const router = express.Router();

router.get("/profile/view", userAuth, (req, res) => {
  try {
    const USER_SAFE_DATA = constructUserData(req.user);
    res.status(200).send({
      data: USER_SAFE_DATA,
    });
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

    const updatedData = {};

    Object.keys(req.body).forEach((key) => (updatedData[key] = req.body[key]));
    const user = await User.findByIdAndUpdate(userId, updatedData, {
      returnDocument: "after",
      runValidators: true,
    });

    res.status(200).json({
      message: `${user.firstName}, your profile updated successfully`,
      data: user,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
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
