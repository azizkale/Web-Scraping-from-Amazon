const express = require("express");
const products = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

products.route("/").get((req, res, next) => {
  axios
    .get(
      "https://en.m.wikipedia.org/wiki/List_of_presidents_of_the_United_States"
    )
    .then((response) => {
      const $ = cheerio.load(response.data);

      console.log($("#section_0").text());
    })
    .catch((error) => {
      console.error(error);
    });
});

module.exports = products;
