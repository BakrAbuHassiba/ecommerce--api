class APIFeature {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  // 1) Filtering
  filter() {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ['page', 'limit', 'sort', 'fields', 'keyword'];
    excludesFields.forEach((field) => delete queryStringObj[field]);

    // Apply filtering using (gte, gt, lte, lt)
    // /products?averageRating[lt]=4&price[gte]=100

    // { price: {$gte: 50}, averageRating: {$gte: 4} }
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryStr = JSON.parse(queryStr);

    this.mongooseQuery = this.mongooseQuery.find(queryStr);

    // Save
    this._filter = queryStr;

    return this;
  }

  // 2) Sorting
  // { sort: "price", sort: "-price", sort: "price - averageRating" }
  sort() {
    if (this.queryString.sort) {
      const { sort } = this.queryString;

      // "price,sold" ==> "price sold"
      const sortBy = sort.split(',').join(' ');

      this.mongooseQuery = this.mongooseQuery
        .collation({ locale: 'en', strength: 2 })
        .sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }

    return this;
  }

  // 3) Fields Limitng
  limitFields() {
    if (this.queryString.fields) {
      const { fields } = this.queryString;
      const selectedFields = fields.split(',').join(' ');

      this.mongooseQuery.select(selectedFields);
    } else {
      this.mongooseQuery.select('-__v');
    }

    return this;
  }

  //  4) Search
  search(modelName) {
    if (this.queryString.keyword) {
      let query = {};

      if (modelName === 'Product') {
        query = {
          $or: [
            { title: { $regex: this.queryString.keyword, $options: 'i' } },
            {
              description: { $regex: this.queryString.keyword, $options: 'i' },
            },
          ],
        };
      } else if (modelName === 'User') {
        query = {
          $or: [
            { firstName: { $regex: this.queryString.keyword, $options: 'i' } },
            { lastName: { $regex: this.queryString.keyword, $options: 'i' } },
            { email: { $regex: this.queryString.keyword, $options: 'i' } },
          ],
        };
      } else {
        query = {
          $or: [{ name: { $regex: this.queryString.keyword, $options: 'i' } }],
        };
      }

      this.mongooseQuery = this.mongooseQuery.find(query);

      // Save
      this._search = query;
    }
    return this;
  }

  // 5) Pagination
  paginate(totalDocs) {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 50;
    const skip = (page - 1) * limit;

    const numberOfPages = Math.ceil(totalDocs / limit);

    // const endIndex = page * limit;

    // Pagination result
    this.paginationResult = {
      currentPage: page,
      limit,
      numberOfPages,
      totalDocs,
      next: page < numberOfPages ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
    };

    // Build query
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }

  async count() {
    // Clone the original query to avoid altering it
    const queryClone = this.mongooseQuery.clone(this._filter || {});

    if (this._search) queryClone.find(this._search);

    // Execute the count on the cloned query
    const totalDocs = await queryClone.countDocuments();

    // Store the count in the instance
    this.totalDocs = totalDocs;
  }
}

module.exports = APIFeature;
