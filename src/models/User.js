const mongoose = require("mongoose");

const User = {
  userId: String,
  email: String,
  username: String,
  password: String,
  userwords: [
    {
      wordId: String,
      showCount: Number,
    },
  ],
};

module.exports = mongoose.model("Users", User);
