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
    isPremium,
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
    isPremium,
  };
};

module.exports = {
  constructUserData,
};
