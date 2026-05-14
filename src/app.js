require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");
const initializeSocket = require("./utils/socket");
const app = express();
const server = http.createServer(app);

// we are whitlisting this domain name, or else cookies will not be set in the browser
const corsOption = {
  origin: "http://localhost:5173",
  credentials: true, // without this Browser will NOT send cookies - req.cookies will be empty
};

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

initializeSocket(server);

connectDB()
  .then(() => {
    console.log("DB connection established");
    server.listen(process.env.PORT, () => {
      console.log(`Example app listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connection to DB");
  });
