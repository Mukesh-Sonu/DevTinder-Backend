const express = require("express");
const User = require("../models/user");
const {
  validateSignupData,
  encryptPassword,
  isEmailValid,
} = require("../utils/validation");
const { constructUserData } = require("../utils/user");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    //Validation of data
    validateSignupData(req);
    const {
      firstName,
      lastName,
      password,
      emailId,
      age,
      photoUrl,
      about,
      skills,
    } = req.body;

    //Encrypt the password
    const hashPassword = await encryptPassword(password);

    // create a new instance of user model
    const user = new User({
      firstName,
      lastName,
      password: hashPassword,
      emailId,
      age,
      photoUrl,
      about,
      skills,
    });

    const savedUser = await user.save();
    const token = savedUser.getJWT();
    res.cookie("token", token);

    res.send({
      message: "User signup successful !!!",
      data: savedUser,
    });
  } catch (error) {
    res.status(400).send("Error saving the user in the DB" + error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!isEmailValid(emailId)) {
      throw new Error("Email is Invalid");
    }

    // will only return {_id, password} since we need only that
    const user = await User.findOne({ emailId }).select("+password");

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.isPasswordValid(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Add JWT token to the cookie;

    const token = user.getJWT();
    res.cookie("token", token);

    const USER_SAFE_DATA = constructUserData(user);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).send({
      data: USER_SAFE_DATA,
    });
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

router.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  res.status(200).send({
    message: "User loggedout successfully",
  });
});

module.exports = router;
