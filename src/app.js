const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();
const port = 3000;

app.post("/signup", async (req, res) => {
  const userObject = {
    firstName: "Mukesh",
    lastName: "Pandian",
    emailId: "mukesh@gmail.com",
    password: "mukesh@gmail.com",
  };

  const user = new User(userObject);

  try {
    await user.save();
    res.send("Saved successfully");
  } catch (error) {
    res.status(400).send("Error saving the user in the DB" + error.message);
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
