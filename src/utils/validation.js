const validator = require("validator");
const bcrypt = require("bcrypt");

const isEmailValid = (emailId) => {
  if (!validator.isEmail(emailId)) {
    false;
  }

  return true;
};

const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password, gender } = req.body;

  // Explicitly validation all fields (not needed as we have it in model level)

  if (!firstName || !lastName) {
    throw new Error("FirstName or LastName cannot be empty");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("Please enter a valid emailId");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

const encryptPassword = async (password) => {
  const hashPassword = await bcrypt.hash(password, 10);

  return hashPassword;
};

module.exports = {
  validateSignupData,
  encryptPassword,
  isEmailValid,
};
