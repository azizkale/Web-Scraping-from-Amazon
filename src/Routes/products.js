const express = require("express");
const products = express.Router();
const Product = require("../models/Product");
const axios = require("axios");
const cheerio = require("cheerio");

let oneProduct = new Product();
let linkList = [];
let errorLinkList = [];

products.route("/").get((req, res, next) => {
  //gets products page
  axios
    .get(
      "https://www.amazon.com.tr/s?bbn=12466209031&rh=n%3A12466208031%2Cn%3A13546647031&dc&qid=1621681498&rnid=12466209031&ref=lp_12466209031_nr_n_2"
    )
    .then(async (response) => {
      const $ = cheerio.load(response.data);
      //gets links of products
      $("span.rush-component > a").map(async (index, prd) => {
        // creates links array
        linkList.push($(prd).attr("href"));
      });
      // gets product details
      for (let i = 0; i < linkList.length; i++) {
        await getDetails(linkList[i]);
      }

      await console.log("telefafi döngüsü başlangış");

      await tryAgainToGetDetails(errorLinkList, 1000);
      await tryAgainToGetDetails(errorLinkList, 2000);

      await console.log("telefafi döngüsü bitiş");

      await console.log(errorLinkList.length);
    })
    .catch((error) => {
      // console.error(error);
    });
});

//functions=========

// 1-) gets the details of products
async function getDetails(link) {
  await axios
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
      console.log("error links sayısı: " + errorLinkList.length);

      // console.log(linkList.length);
      return oneProduct;
    })
    .catch((error) => {
      // gets the links that can not be responded
      errorLinkList.push(link);
      // console.error(error);
    });
}

// 2-) try to gets the details of products that can not be responded

async function tryAgainToGetDetails(errorlinksarray, time) {
  for (let i = 0; i < errorlinksarray.length; i++) {
    await (function (i) {
      setTimeout(function () {
        getDetails[errorlinksarray[i]];
        errorlinksarray.splice(i, 1);
      }, i * time);
    })(i);
  }
}

module.exports = products;
