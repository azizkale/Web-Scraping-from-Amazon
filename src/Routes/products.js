const express = require("express");
const products = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

products.route("/").get((req, res, next) => {
  axios
    .get(
      "https://www.amazon.com.tr/b/ref=sv_ap_gender_4_6_1_1?node=13546667031"
    )
    .then((response) => {
      const $ = cheerio.load(response.data);

      console.log($(".octopus-best-seller-card > div > span").text());
    })
    .catch((error) => {
      console.error(error);
    });
});

module.exports = products;
