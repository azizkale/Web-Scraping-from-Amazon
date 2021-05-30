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
  await getAllDetailPageLinksOfProducts(listProductPages);
});

//functions=========

// 1-) gets the details of products
async function getDetails(link) {
  let oneProduct = new Product();

  await axios.get(link).then(async (response2) => {
    const $ = await cheerio.load(response2.data);

    oneProduct.pLink = link;
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
  });
  return oneProduct;
}

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
        return linkslist;
      })
      .catch((error) => {});
  }
  // await console.log(linkslist);
  // await console.log(linkslist.length);

  await linkslist.map((plink) => {
    try {
      let product = getDetails(plink)
        .then()
        .catch((error) => {
          console.log(error.response.status);
        });
      product.then(async (result) => {
        console.log(result);
      });
    } catch (error) {
      try {
        let product = getDetails(plink);
        product.then(async (result) => {
          console.log(result);
        });
      } catch (error) {
        console.log("zort");
      }
    }
  });

  // for (let i = 0; i < linkslist.length; i++) {
  //   try {
  //     await getDetails(linkslist[i]);
  //   } catch (error) {
  //     errorLinkList.push(linkslist[i]);
  //   }
  // }

  // for (let i = 0; i < errorLinkList.length; i++) {
  //   try {
  //     await getDetails(errorLinkList[i]);
  //     await errorLinkList.splice(i, 1);
  //   } catch (error) {
  //     try {
  //       await getDetails(errorLinkList[i]);
  //       await errorLinkList.splice(i, 1);
  //     } catch (error) {
  //       try {
  //         await getDetails(errorLinkList[i]);
  //         await errorLinkList.splice(i, 1);
  //       } catch (error) {
  //         try {
  //           await getDetails(errorLinkList[i]);
  //           await errorLinkList.splice(i, 1);
  //         } catch (error) {
  //           console.log("zort");
  //         }
  //       }
  //     }
  //   }
  // }
};

// sleep function
const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = products;
