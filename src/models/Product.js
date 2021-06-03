class Product {
  constructor(
    plink,
    ptitle,
    pprice,
    pavailability,
    companyname,
    color,
    size,
    description
  ) {
    this.pLink = plink;
    this.pTitle = ptitle;
    this.pPrice = pprice;
    this.pAvailability = pavailability;
    this.pCompanyName = companyname;
    this.pColor = color;
    this.pSize = size;
    this.pDescription = description;
  }
}

module.exports = Product;
