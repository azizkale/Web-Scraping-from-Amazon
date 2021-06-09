const express = require("express");
const products = express.Router();
// const Product = require("../models/Product");
const axios = require("axios");
const cheerio = require("cheerio");
const { createApolloFetch } = require("apollo-fetch");

products.route("/links").get(async (req, res, next) => {
  let listProductPages = []; // gets all pages links which have product details

  let url =
    "https://www.amazon.com.tr/s?i=fashion&bbn=13547133031&rh=n%3A12466553031%2Cn%3A13546647031%2Cn%3A13546667031%2Cn%3A13546760031%2Cn%3A13547133031%2Cn%3A13547931031&dc&fs=true&qid=1622689334&rnid=13547133031&ref=sr_pg_2";

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

  // gets all detail pages of products (product details)
  await getAllDetailPageLinksOfProducts(listProductPages).then(
    async (result) => {
      res.send(result);
    }
  );
});

products.route("/product").get(async (req, res, next) => {
  const fetch = await createApolloFetch({
    uri: "http://localhost:4000/",
  });

  fetch({
    query: `
          query GetProductDetails($url: String) {
            getProductDetails(url: $url){
              link
              title
              price
              availability
              companyname
              color
              size
              description
              info {
                subInfoTitle
                subInfo
              }
              technicalDetails {
                subInfoTitle
                subInfo
              }
              additionalInfo {
                subInfoTitle
                subInfo
              }
            }                 
          }
      `,
    variables: {
      url: encodeURI(req.query.link),
    },
  })
    .then(async (result) => {
      console.log(result);
      res.send(result.data.getProductDetails);
      return result.data.getProductDetails;
    })
    .catch((error) => {
      console.log("error");
    });
});

//functions=========

// 1-) gets the details of products
const getDetails = async (plink) => {
  const fetch = await createApolloFetch({
    uri: "http://localhost:4000/",
  });

  fetch({
    query: `
          query GetProductDetails($url: String) {
            getProductDetails(url: $url){
              link
              title
              price
              availability
              companyname
              color
              size
              description
              info {
                subInfoTitle
                subInfo
              }
              technicalDetails {
                subInfoTitle
                subInfo
              }
              additionalInfo {
                subInfoTitle
                subInfo
              }
            }                 
          }
      `,
    variables: {
      url: plink,
    },
  }).then(async (result) => {
    return result.data.getProductDetails;
  });

  // console.log("error links sayısı: " + errorlinklist.length);
  // console.log("ürünler: " + listproduct.length);
};

// 2-) gets the details of products by using errorlinkist from getDetails(first)
const getDetails2 = async (errorlinklist, listproduct) => {
  let oneProduct = new Product();
  for (let i = 0; i < errorlinklist.length; i++) {
    await console.log("telafi" + i);

    let param1 = errorlinklist[i].errorstatus;
    while (param1 === 503) {
      await axios
        .get(errorlinklist[i].link)
        .then(async (response2) => {
          const $ = await cheerio.load(response2.data);

          oneProduct.pLink = errorlinklist[i].link;
          oneProduct.pTitle = $("#productTitle").text().trim();
          oneProduct.pPrice = $("#priceblock_ourprice").text();
          oneProduct.pAvailability = $("#availability > span").text().trim();
          oneProduct.pCompanyName = $("a#bylineInfo").text();

          oneProduct.pColor = [];
          $("#twister")
            .find($("#variation_color_name > ul > li"))
            .map(function (i, el) {
              // this === el
              return oneProduct.pColor.push($(this).find($("img")).attr("alt"));
            });
          oneProduct.pColor.push(
            $("#variation_color_name").find($("span.selection")).text().trim()
          );

          oneProduct.pSize = [];
          $("#twister > #variation_size_name")
            .find($("select > option"))
            .map((i, el) => {
              return oneProduct.pSize.push($(el).text().trim());
            });
          oneProduct.pSize.push(
            $("#twister > #variation_size_name")
              .find($("span.selection"))
              .text()
              .trim()
          );

          oneProduct.pDescription = [];
          $("#feature-bullets > ul > li > span").map((i, el) => {
            oneProduct.pDescription.push($(el).text().trim());
          });

          $("div#productDescription > p").map((i, el) => {
            oneProduct.pDescription.push($(el).text().trim());
          });

          listproduct.push(oneProduct);
          console.log(oneProduct);
          console.log("ürünler: " + listproduct.length);

          param1 = "";
        })
        .catch((error) => {
          param1 = error.response.status;
        });
    }
  }
  return oneProduct;
};

// gets all products-details pages links
const getAllProductPages = async (listpages, $) => {
  //
  // gets total number of the products on category pages
  const liCountOnPaginationSection = $("ul.a-pagination > li").length;

  let totalPageCount =
    $(
      ".celwidget, .slot=MAIN, .template=PAGINATION, .widgetId=pagination-button"
    )
      .find($("ul > li")[liCountOnPaginationSection - 2])
      .text() || 1;

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

module.exports = products;
