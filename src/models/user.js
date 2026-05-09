const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const PRIVATE_KEY = "devTinder";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, //no error will be thrown, but it will conver to lowercase
      trim: true, //no error will be thrown, but it will conver to trim,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password: " + value);
        }
      },
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        const genderSet = new Set(["male", "female", "others"]);
        if (!genderSet.has(value)) {
          throw new Error("Gender data is not valid");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://img.magnific.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?semt=ais_hybrid&w=740&q=80",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("photoUrl is invalid: " + value);
        }
      },
    },
    about: {
      type: String,
      default: "This is default about of the User",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

// This is called offloading methods to schema methods
userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user }, PRIVATE_KEY, { expiresIn: "7d" });
  return token;
};

userSchema.methods.isPasswordValid = async function (password) {
  const hashPassword = this.password;
  console.log(hashPassword, password, "sakdnskn");
  return await bcrypt.compare(password, hashPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
