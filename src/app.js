const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { userAuth } = require("./middlewares/auth");
const cookieParser = require("cookie-parser");
const {
  validateSignupData,
  encryptPassword,
  isEmailValid,
} = require("./utils/validation");
const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  //Validation of data
  //Encrypt the password

  // create a new instance of user model

  try {
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
    const hashPassword = await encryptPassword(password);
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
    await user.save();
    res.send("Saved successfully");
  } catch (error) {
    res.status(400).send("Error saving the user in the DB" + error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!isEmailValid(emailId)) {
      throw new Error("Email is Invalid");
    }

    // will only return {_id, password} since we need only that
    const user = await User.findOne({ emailId }).select("password");

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

    return res.status(200).send("Login Successful");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

app.delete("/user", userAuth, async (req, res) => {
  const userId = req.body.userId;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    return res.status(200).send(deletedUser);
  } catch (error) {
    res.status(400).send("Error saving the user in the DB" + error.message);
  }
});

app.get("/profile", userAuth, (req, res) => {
  res.status(200).send("Can view");
});

app.patch("/user", userAuth, async (req, res) => {
  const userId = req.user._id;

  try {
    const ALLOWED_UPDATES = [
      "firstName",
      "lastName",
      "photoUrl",
      "about",
      "skills",
      "age",
      "gender",
    ];

    const isUpdateAllowed = Object.keys(req.body).every((key) =>
      ALLOWED_UPDATES.includes(key)
    );

    if (!isUpdateAllowed) {
      throw new Error("Update is not allowed");
    }

    const user = await User.findByIdAndUpdate(userId, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send("Error saving the user in the DB" + error.message);
  }
});

app.get("/user", userAuth, async (req, res) => {
  try {
    const user = await User.find({ emailId: req.body.emailId });
    res.send(user);
  } catch (error) {
    res.status.send("Something went wrong " + error.message);
  }
});

app.get("/feed", userAuth, async (req, res) => {
  ///feed - GET All the users from the DB
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status.send("Something went wrong " + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("DB connection established");
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connection to DB");
  });
