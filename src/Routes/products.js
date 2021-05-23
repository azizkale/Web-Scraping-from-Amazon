const express = require("express");
const products = express.Router();
const Product = require("../models/Product");
const axios = require("axios");
const cheerio = require("cheerio");

let pList = new Product();

products.route("/").get((req, res, next) => {
  //gets products page
  axios
    .get(
      "https://www.amazon.com.tr/s?bbn=12466209031&rh=n%3A12466208031%2Cn%3A13546647031&dc&qid=1621681498&rnid=12466209031&ref=lp_12466209031_nr_n_2"
    )
    .then((response) => {
      const $ = cheerio.load(response.data);
      //gets links of products
      $(".sg-col-inner").map((index, prd) => {
        // gets products details page

        let oneProduct = new Product();

        oneProduct.pLink =
          "https://www.amazon.com.tr" + $(prd).find($("a")).attr("href");

        axios
          .get(`https://www.amazon.com.tr${$(prd).find($("a")).attr("href")}`)
          .then((response2) => {
            const $ = cheerio.load(response2.data);

            oneProduct.pTitle = $("#productTitle").text().trim();
            oneProduct.pStar = $("i > span").text().split(",")[0];
            console.log(oneProduct);
          })
          .catch((error2) => {
            // console.log(error2);
          });
      });
    })
    .catch((error) => {
      // console.error(error);
    });
});

module.exports = products;
