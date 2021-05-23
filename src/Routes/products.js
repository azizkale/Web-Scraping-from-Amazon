const express = require("express");
const products = express.Router();
const Product = require("../models/Product");
const axios = require("axios");
const cheerio = require("cheerio");

let oneProduct = new Product();
let linkList = [];

products.route("/").get((req, res, next) => {
  //gets products page
  axios
    .get(
      "https://www.amazon.com.tr/s?bbn=12466209031&rh=n%3A12466208031%2Cn%3A13546647031&dc&qid=1621681498&rnid=12466209031&ref=lp_12466209031_nr_n_2"
    )
    .then((response) => {
      const $ = cheerio.load(response.data);
      //gets links of products
      $("span.rush-component > a").map(async (index, prd) => {
        // creates links array
        linkList.push($(prd).attr("href"));
      });

      // gets product details
      for (let i = 0; i < linkList.length; i++) {
        axios
          .get("https://www.amazon.com.tr" + linkList[i])
          .then((response2) => {
            const $ = cheerio.load(response2.data);

            oneProduct.pLink = "https://www.amazon.com.tr" + linkList[i];
            oneProduct.pTitle = $("#productTitle").text().trim();
            oneProduct.pStar = $("i > span").text().split(",")[0];
            console.log(oneProduct);
          })
          .catch((error) => {
            // console.error(error);
          });
      }
    })
    .catch((error) => {
      // console.error(error);
    });
});

module.exports = products;
