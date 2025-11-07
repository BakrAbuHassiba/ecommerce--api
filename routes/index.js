const categoryRoute = require('./categoryRoute');
const subcategoryRoute = require('./subcategoryRoute');
const brandRoute = require('./brandRoute');
const productRoute = require('./productRoute');
const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const reviewRoute = require('./reviewRoute');
const wishlistRoute = require('./wishlistRoute');
const addressRoute = require('./addressRoute');
const couponRoute = require('./couponRoute');
const cartRoute = require('./cartRoute');
const orderRoute = require('./orderRoute');

// Mount Routes
const mountRoutes = (app) => {
  app.get('/', (req, res) => {
    res.redirect('/api/v2');
  });
  app.get('/api/v2', (req, res) => {
    res.status(200).json({
      message: 'Welcome to the E-Commerce API v2 🚀',
      status: 'success',
      routes: {
        products: '/api/v2/products',
        categories: '/api/v2/categories',
        auth: '/api/v2/auth',
      },
    });
  });
  app.use('/api/v2/categories', categoryRoute);
  app.use('/api/v2/subcategories', subcategoryRoute);
  app.use('/api/v2/brands', brandRoute);
  app.use('/api/v2/products', productRoute);
  app.use('/api/v2/users', userRoute);
  app.use('/api/v2/auth', authRoute);
  app.use('/api/v2/reviews', reviewRoute);
  app.use('/api/v2/wishlist', wishlistRoute);
  app.use('/api/v2/addresses', addressRoute);
  app.use('/api/v2/coupons', couponRoute);
  app.use('/api/v2/cart', cartRoute);
  app.use('/api/v2/orders', orderRoute);
};

module.exports = mountRoutes;
