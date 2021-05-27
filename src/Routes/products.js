const express = require("express");
const products = express.Router();
const Product = require("../models/Product");
const axios = require("axios");
const cheerio = require("cheerio");

let listLinks = [];
let errorLinkList = [];
let listProduct = [];

products.route("/").get((req, res, next) => {
  //gets products page
  axios
    .get(
      "https://www.amazon.com.tr/s?rh=n%3A21440429031&fs=true&ref=lp_21440429031_sar"
    )
    .then(async (response) => {
      const $ = cheerio.load(response.data);

      await getAllProductLinks(listLinks, $);

      // await console.log(getAllProductLinks);
      //gets links of products
      // $("span.rush-component > a").map(async (index, prd) => {
      //   // creates links array
      //   linkList.push($(prd).attr("href"));
      // });
      // // gets product details
      // for (let i = 0; i < linkList.length; i++) {
      //   await getDetails(linkList[i]);
      // }
      // await console.log("telafi başlıyor");

      // // gets product details
      // for (let i = 0; i < errorLinkList.length; i++) {
      //   await getDetails(errorLinkList[i]);
      // }
      // console.log(listProduct);
    })
    .catch((error) => {
      // console.error(error);
    });
});

//functions=========

// 1-) gets the details of products
async function getDetails(link) {
  let oneProduct = new Product();

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
      listProduct.push({
        pLink: oneProduct.pLink,
        pTitle: oneProduct.pTitle,
        pPrice: oneProduct.pPrice,
        pAvailability: oneProduct.pAvailability,
        pCompanyName: oneProduct.pCompanyName,
        pColor: oneProduct.pColor,
        pSize: "3 Yaş",
      });
      console.log("error links sayısı: " + errorLinkList.length);
      console.log("ürünler: " + listProduct.length);

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
const getAllProductLinks = async (listpagelinks, $) => {
  //
  // gets total number of the products on category pages
  const liCountOnPaginationSection = $("ul.a-pagination > li").length;

  let totalPageCount = $(
    ".celwidget, .slot=MAIN, .template=PAGINATION, .widgetId=pagination-button"
  )
    .find($("ul > li")[liCountOnPaginationSection - 2])
    .text();

  console.log("sayfa sayısı: " + totalPageCount);
  // gets the next page link on first page (2.page)
  let nextPageLink = $(
    ".celwidget, .slot=MAIN, .template=PAGINATION, .widgetId=pagination-button"
  )
    .find("ul > li.a-last > a")
    .attr("href");

  await listpagelinks.push(nextPageLink);

  // gets all next pages links except first page (3. and another pages)
  for (let j = 0; j < totalPageCount; j++) {
    await axios
      .get("https://www.amazon.com.tr" + nextPageLink)
      .then(async (resp) => {
        const $ = await cheerio.load(resp.data);

        nextPageLink = await $(
          ".celwidget, .slot=MAIN, .template=PAGINATION, .widgetId=pagination-button"
        )
          .find("ul > li.a-last > a")
          .attr("href");
      })
      .catch((error) => {});
    await listpagelinks.push(nextPageLink);
  }

  return listpagelinks;
};

//////////////////////
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
