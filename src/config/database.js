const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://mukesh:Candy%402020@devtinder.6b1gstv.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
