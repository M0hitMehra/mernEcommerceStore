class Apifeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const priceValue = parseFloat(this.queryStr.keyword);
    const marginOfError = priceValue/10; // Define your desired margin of error here

    const minPrice = priceValue - marginOfError;
    const maxPrice = priceValue + marginOfError;
    const keyword = this.queryStr.keyword.trim()
      ? isNaN(this.queryStr.keyword.trim())
        ? {
            $or: [
              {
                name: {
                  $regex: this.queryStr.keyword.trim(),
                  $options: "i",
                },
              },
              {
                description: {
                  $regex: this.queryStr.keyword.trim(),
                  $options: "i",
                },
              },
            ],
          }
        : {
            $or: [
              { price: { $gte: minPrice, $lte: maxPrice } },
               
            ],
          }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    //Removing Some Fileds for Category
    const removeFields = ["keyword", "page", "limit"];

    removeFields.forEach((key) => {
      delete queryCopy[key];
    });

    // For Price Category
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

export default Apifeatures;
