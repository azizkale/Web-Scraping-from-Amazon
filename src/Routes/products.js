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
    .then(async (response) => {
      const $ = await cheerio.load(response.data);
      //gets links of products
      $("span.rush-component > a").map(async (index, prd) => {
        // creates links array
        linkList.push($(prd).attr("href"));
      });
      // gets product details
      for (let i = 0; i < linkList.length; i++) {
        (function (index) {
          setTimeout(function () {
            getDetails(linkList[i]);
          }, i * 4000);
        })(i);
      }
    })
    .catch((error) => {
      // console.error(error);
    });
});

function getDetails(link) {
  axios
    .get("https://www.amazon.com.tr" + link)
    .then(async (response2) => {
      const $ = await cheerio.load(response2.data);

      oneProduct.pLink = "https://www.amazon.com.tr" + link;
      oneProduct.pTitle = $("#productTitle").text().trim();
      oneProduct.pPrice = $("#priceblock_ourprice").text();
      oneProduct.pAvailability = $("#availability > span").text().trim();
      oneProduct.pCompanyName = $("a#bylineInfo").text();

      let arr = [];
      $("#twister")
        .find($("#variation_color_name > ul > li"))
        .map(function (i, el) {
          // this === el
          return arr.push($(this).find($("img")).attr("alt"));
        });
      arr.push(
        $("#variation_color_name").find($("span.selection")).text().trim()
      );
      oneProduct.pColor = arr;

      oneProduct.pSize = $("#twister > #variation_size_name")
        .find($("span.selection"))
        .text()
        .trim();
      console.log(oneProduct);
    })
    .catch((error) => {
      console.error("error");
    });
}

module.exports = products;
