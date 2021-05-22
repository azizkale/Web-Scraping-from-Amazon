const express = require("express");
const products = express.Router();
const Product = require("../models/Product");
const axios = require("axios");
const cheerio = require("cheerio");

products.route("/").get((req, res, next) => {
  axios
    .get(
      "https://www.amazon.com.tr/gp/bestsellers/apparel/13546667031/ref=zg_bs_nav_a_2_13546647031"
    )
    .then((response) => {
      const $ = cheerio.load(response.data);

      // console.log($(".octopus-best-seller-card > div > span").text());
      Product.pCategory = $(".zg-banner-text").text();
      Product.pTitle = $("h1 > span").text();
      Product.pImage = $("li > img").text();
      Product.pName = $("li > .zg-item > a > .p13n-sc-truncated").innerHTML;
      console.log(Product);
    })
    .catch((error) => {
      console.error(error);
    });
});

module.exports = products;
