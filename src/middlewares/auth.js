const jwt = require("jsonwebtoken");
const User = require("../models/user");
const PRIVATE_KEY = "devTinder";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send({
        message: "Please Login",
      });
    }

    const decodedObj = jwt.verify(token, PRIVATE_KEY);
    const { _id } = decodedObj;
    const user = await User.findOne({ _id });

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
};

module.exports = { userAuth };
