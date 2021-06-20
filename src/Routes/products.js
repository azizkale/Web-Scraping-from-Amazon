const express = require("express");
const products = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { createApolloFetch } = require("apollo-fetch");

let listProductPages = [];
products.route("/links").get(async (req, res, next) => {
  // gets all pages links which have product details

  let url = req.query["firsturl"];

  //gets products list pages
  await axios
    .get(url)
    .then(async (response) => {
      const $ = cheerio.load(response.data);
      listProductPages = [];
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

products.route("/variationlinksofproduct").get(async (req, res, next) => {
  const fetch = await createApolloFetch({
    uri: "http://localhost:4000/",
  });

  fetch({
    query: `
          query GetLinksWithAsin($url: String) {
            getLinksWithAsin(url: $url){
              asinColor
              asinSize
              productUrl
              variationsLinksOfProduct
            }                 
          }
      `,
    variables: {
      url: encodeURI(req.query["producturl"]),
    },
  })
    .then(async (result) => {
      res.send(result.data.getLinksWithAsin);
      return result.data.getLinksWithAsin;
    })
    .catch((error) => {
      console.log("variaton error");
    });
});

products.route("/product").get(async (req, res, next) => {
  const fetch = await createApolloFetch({
    uri: "http://localhost:4000/",
  });

  fetch({
    query: `
          query GetSingleProduct($url: String) {
            getSingleProduct(url: $url){
              asin
              link
              title
              price
              availability
              companyname
              description
              color
              size
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
              seller
              category
              imagelink
            }                 
          }
      `,
    variables: {
      url: encodeURI(req.query["productlink"]),
    },
  })
    .then(async (result) => {
      res.send(result.data.getSingleProduct);
      return result.data.getSingleProduct;
    })
    .catch((error) => {
      console.log("error");
    });
});

//functions=========
// gets all products-details pages links (from pagination pages)
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
