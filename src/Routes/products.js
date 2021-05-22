const express = require("express");
const products = express.Router();
const rp = require("request-promise");
const $ = require("cheerio");
const url =
  "https://en.wikipedia.org/wiki/List_of_Presidents_of_the_United_States";

products.route("/").get((req, res, next) => {
  rp(url)
    .then(function (html) {
      //success!

      res.end(html);
    })
    .catch(function (err) {
      //handle error
    });
});

module.exports = products;
