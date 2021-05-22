const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const products = require("./src/Routes/products");

const PORT = process.env.PORT || 4001;

dotenv.config();

const app = express();
app.use(cors());
app.use(morgan("dev"));

app.use("/product", products);

app.listen(PORT, () => console.log(`server runs on port ${PORT}`));
