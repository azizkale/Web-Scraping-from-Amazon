const express = require("express");
const products = express.Router();
const Product = require("../models/Product");
const axios = require("axios");
const cheerio = require("cheerio");

let listProductPages = []; // gets all pages links which have product details
let listLinksofAllProducts = [];
let errorLinkList = [];
let listProduct = [];

products.route("/").get(async (req, res, next) => {
  let url =
    "https://www.amazon.com.tr/s?i=fashion&bbn=13547133031&rh=n%3A12466553031%2Cn%3A13546647031%2Cn%3A13546667031%2Cn%3A13546760031%2Cn%3A13547133031%2Cn%3A13547931031&dc&fs=true&qid=1622296624&rnid=13547133031&ref=sr_pg_1";

  //gets products list pages
  await axios
    .get(url)
    .then(async (response) => {
      const $ = cheerio.load(response.data);

      listProductPages.push(url); // first page

      await getAllProductPages(listProductPages, $);
    })
    .catch((error) => {
      // console.error(error);
    });

  // gets all detail pages of products
  await getAllDetailPageLinksOfProducts(listProductPages).then(
    async (result) => {
      // result = link Count
      // get product details
      await getDetails(result, listProduct, errorLinkList).then(
        async (result2) => {
          await console.log(errorLinkList);
          await console.log("pro:" + listProduct.length);
          await console.log("linkCount:" + result.length);
        }
      );
    }
  );
});

//functions=========

// 1-) gets the details of products
const getDetails = async (linklist, listproduct, errorlinklist) => {
  let oneProduct = new Product();
  for (let i = 0; i < linklist.length; i++) {
    await axios
      .get(linklist[i])
      .then(async (response2) => {
        const $ = await cheerio.load(response2.data);

        oneProduct.pLink = linklist[i];
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

        listproduct.push({
          pLink: oneProduct.pLink,
          pTitle: oneProduct.pTitle,
          pPrice: oneProduct.pPrice,
          pAvailability: oneProduct.pAvailability,
          pCompanyName: oneProduct.pCompanyName,
          pColor: oneProduct.pColor,
          pSize: "3 Yaş",
        });
        console.log("error links sayısı: " + errorlinklist.length);
        console.log("ürünler: " + listproduct.length);
      })
      .catch((error) => {
        errorlinklist.push({
          link: linklist[i],
          errorstatus: error.response.status,
        });
      });
  }

  return {
    prolist: listproduct,
    errlist: errorlinklist,
  };
};

// gets all products-details pages links
const getAllProductPages = async (listpages, $) => {
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

  await listpages.push("https://www.amazon.com.tr" + nextPageLink);

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
    await listpages.push("https://www.amazon.com.tr" + nextPageLink);
  }

  return listpages;
};

// gets all detail pages of products from product pages
const getAllDetailPageLinksOfProducts = async (pageslist) => {
  let linkslist = [];

  for (let i = 0; i < pageslist.length; i++) {
    await axios
      .get(pageslist[i])
      .then(async (resp) => {
        const $ = await cheerio.load(resp.data);
        // gets links of products on the first page
        await $("span.rush-component > a").map(async (index, prd) => {
          // creates links array
          await linkslist.push(
            "https://www.amazon.com.tr" + $(prd).attr("href")
          );
        });
      })
      .catch((error) => {});
  }
  return linkslist;
};

// sleep function
const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = products;
