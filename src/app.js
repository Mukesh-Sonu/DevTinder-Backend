const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const dotenv = require("dotenv");
const app = express();

// we are whitlisting this domain name, or else cookies will not be set in the browser
const corsOption = {
  origin: "http://localhost:5173",
  credentials: true, // without this Browser will NOT send cookies - req.cookies will be empty
};

dotenv.config();
app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("DB connection established");
    app.listen(process.env.PORT, () => {
      console.log(`Example app listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connection to DB");
  });
