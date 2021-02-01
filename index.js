const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./src/models/User");

const PORT = process.env.PORT || 4001;

dotenv.config();
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const app = express();
    app.use(cors());
    app.use(morgan("dev"));

    app.get("/", async (req, res) => {
      const users = await User.find();
      res.send(users);
    });

    app.listen(PORT, () => console.log(`server runs on ${PORT}`));
  });
