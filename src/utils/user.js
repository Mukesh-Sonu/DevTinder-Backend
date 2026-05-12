const { USER_SAFE_DATA } = require("../constants");

const constructUserData = (user) => {
  if (!user) return null;

  const {
    _id,
    firstName,
    lastName,
    emailId,
    age,
    gender,
    about,
    photoUrl,
    skills,
    createdAt,
  } = user;

  return {
    id: _id,
    firstName,
    lastName,
    emailId,
    age,
    gender,
    about,
    photoUrl,
    skills,
    createdAt,
  };
};

module.exports = {
  constructUserData,
};
