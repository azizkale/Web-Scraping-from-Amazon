const express = require("express");
const excell = express.Router();
const excel = require("excel4node");

function createTestWorkbook() {
  const workbook = new excel.Workbook();
  const style = workbook.createStyle({
    font: { color: "#0101FF", size: 11 },
  });

  const worksheet = workbook.addWorksheet("Products");

  const arrayToWrite = [
    {
      pLink:
        "https://www.amazon.com.tr/Play-Baby-722151-Korumal%C4%B1-Turkuaz/dp/B0079T65UY/ref=sr_1_31?dchild=1&qid=1621867785&rnid=12466209031&s=apparel&sr=1-31",
      pTitle:
        "I Play Baby 722151 50 Faktör Korumalı, Çok Hafif, Bezli Şort Mayo, Turkuaz 24-36 ay",
      pPrice: "66,85 TL",
      pAvailability: "Stokta sadece 2 adet kaldı.",
      pCompanyName: "I Play Baby",
      pColor: ["Turkuaz", "Siyah", "Turkuaz"],
      pSize: "24-36 ay",
    },
    {
      pLink:
        "https://www.amazon.com.tr/DeFacto-Bask%C4%B1l%C4%B1-T-Shirt-%C3%9Cretici-%C3%96l%C3%A7%C3%BCs%C3%BC/dp/B08B1ZDF89/ref=sr_1_48?dchild=1&qid=1621867785&rnid=12466209031&s=apparel&sr=1-48",
      pTitle:
        "DeFacto Erkek Bebek Baskılı Şort T-shirt Takım Tişört Erkek bebek",
      pPrice: "39,99 TL - 49,99 TL",
      pAvailability: "",
      pCompanyName: "DeFacto",
      pColor: ["Bej (Bej Er138)", "Sarı (Sarı Yl118)", "Bej (Bej Er138)"],
      pSize: "",
    },
    {
      pLink:
        "https://www.amazon.com.tr/BabyJem-8699208311555-Ali%C5%9Ftirma-K%C3%BClodu-Kutulu/dp/B078TP6P4F/ref=sr_1_2?dchild=1&qid=1621867785&rnid=12466209031&s=apparel&sr=1-2",
      pTitle: "Babyjem Alıştırma Külodu Kutulu, 2'li 3 Yaş, Mavi",
      pPrice: "39,95 TL",
      pAvailability: "Stokta var.",
      pCompanyName: "Babyjem",
      pColor: ["Beyaz", "Mavi", "Pembe", "Mavi"],
      pSize: "3 Yaş",
    },
  ];

  arrayToWrite.forEach((row, rowIndex) => {
    let colIndex = 0;
    worksheet.cell(1, 1).string("Link");
    worksheet.cell(1, 2).string("Ürün Adı");
    worksheet.cell(1, 3).string("Ürün Fiyatı");
    worksheet.cell(1, 4).string("Stok Durumu");
    worksheet.cell(1, 5).string("Firma Adı");
    worksheet
      .cell(rowIndex + 1, colIndex++ + 1)
      .string(row.pLink)
      .style(style);
    worksheet
      .cell(rowIndex + 1, colIndex++ + 1)
      .string(row.pTitle)
      .style(style);
    worksheet
      .cell(rowIndex + 1, colIndex++ + 1)
      .string(row.pPrice)
      .style(style);
    worksheet
      .cell(rowIndex + 1, colIndex++ + 1)
      .string(row.pAvailability)
      .style(style);
    worksheet
      .cell(rowIndex + 1, colIndex++ + 1)
      .string(row.pCompanyName)
      .style(style);
  });

  return workbook;
}

excell.route("/").get((req, res, next) => {
  /* Allow client to download spreadsheet. */

  let workbook = createTestWorkbook();
  workbook.write("workbook.xlsx", res);
});

module.exports = excell;
