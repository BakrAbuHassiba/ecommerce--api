require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const cloudinary = require('./config/cloudinary');

// Models
const Brand = require('./models/brandModel');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const Subcategory = require('./models/subcategoryModel');
const Review = require('./models/reviewModel');
const Cart = require('./models/cartModel');
const Order = require('./models/orderModel');
const Coupon = require('./models/couponModel');

// =================== CONFIG ===================
const MONGO_URI = process.env.DB_URI;
const MAIN_FOLDER = 'shoply';
const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/600x400?text=Shoply';
const UPLOAD_FOLDER = {
  brands: `${MAIN_FOLDER}/brands`,
  categories: `${MAIN_FOLDER}/categories`,
  products: `${MAIN_FOLDER}/products`,
  users: `${MAIN_FOLDER}/users`,
};

// =================== SAMPLE IMAGES ===================
const BRAND_IMAGES = {
  Apple: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
  Samsung: 'https://images.unsplash.com/photo-1580910051073-3e06f5e0f6b8',
  Sony: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
  Adidas: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
  Nike: 'https://images.unsplash.com/photo-1581291519195-ef11498d1cf5',
};

const CATEGORY_IMAGES = {
  Phones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
  Laptops: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
  Headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  Clothing: 'https://images.unsplash.com/photo-1521334884684-d80222895322',
};

const PRODUCT_IMAGES = {
  Phones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
  ],
  Laptops: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
  ],
  Headphones: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    'https://images.unsplash.com/photo-1580894908361-967195033bff',
  ],
  Clothing: [
    'https://images.unsplash.com/photo-1521334884684-d80222895322',
    'https://images.unsplash.com/photo-1520974735194-6a1833d0a9d8',
  ],
};

// =================== DB CONNECT ===================
async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected.');
}

// =================== CLOUDINARY UPLOAD (Safe + Placeholder) ===================
async function uploadImageToCloudinaryFromUrl(remoteUrl, subFolder, publicId) {
  try {
    const response = await axios.get(remoteUrl, {
      responseType: 'arraybuffer',
    });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `${MAIN_FOLDER}/${subFolder}`,
      public_id: publicId,
      resource_type: 'image',
      overwrite: true,
    });

    return result;
  } catch (error) {
    console.warn(`⚠️ Upload failed for ${remoteUrl}, using placeholder.`);
    try {
      const fallback = await axios.get(PLACEHOLDER_IMAGE_URL, {
        responseType: 'arraybuffer',
      });
      const base64 = Buffer.from(fallback.data, 'binary').toString('base64');
      const dataURI = `data:image/jpeg;base64,${base64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: `${MAIN_FOLDER}/${subFolder}`,
        public_id: `${publicId}-placeholder`,
      });
      return result;
    } catch (err2) {
      console.error('❌ Even placeholder upload failed:', err2.message);
      throw err2;
    }
  }
}

// =================== HELPERS ===================
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

// =================== IMPORT DATA ===================
async function importData() {
  try {
    console.log('🌱 Starting seeding ...');

    await Promise.all([
      Brand.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      User.deleteMany(),
      Subcategory.deleteMany(),
      Review.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
      Coupon.deleteMany(),
    ]);

    // 1️⃣ USERS
    const adminPassword = '12345678';
    const userPassword = '12345678';

    const [adminUser, normalUser] = await Promise.all([
      User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@shoply.test',
        phone: '01000000000',
        password: adminPassword,
        role: 'admin',
      }),
      User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@shoply.test',
        phone: '01000000001',
        password: userPassword,
        role: 'user',
      }),
    ]);
    console.log('👥 Users created.');

    // 2️⃣ BRANDS
    const brandDocs = [];
    for (const name of Object.keys(BRAND_IMAGES)) {
      const slug = slugify(name);
      const upload = await uploadImageToCloudinaryFromUrl(
        BRAND_IMAGES[name],
        'brands',
        `brand-${slug}-${Date.now()}`
      );
      const brand = await Brand.create({
        name,
        slug,
        image: upload.public_id,
      });
      brandDocs.push(brand);
      console.log(`🏷️ Created brand ${brand.name}`);
    }

    // 3️⃣ CATEGORIES
    const categoryDocs = [];
    for (const name of Object.keys(CATEGORY_IMAGES)) {
      const slug = slugify(name);
      const upload = await uploadImageToCloudinaryFromUrl(
        CATEGORY_IMAGES[name],
        'categories',
        `category-${slug}-${Date.now()}`
      );
      const category = await Category.create({
        name,
        slug,
        image: upload.public_id,
      });
      categoryDocs.push(category);
      console.log(`📂 Created category ${category.name}`);
    }

    // 4️⃣ SUBCATEGORIES (brand-based)
    const subcategoryDocs = [];
    for (const brand of brandDocs) {
      const category =
        brand.name === 'Apple' || brand.name === 'Samsung'
          ? categoryDocs.find((c) => c.name === 'Phones')
          : brand.name === 'Sony'
            ? categoryDocs.find((c) => c.name === 'Headphones')
            : categoryDocs.find((c) => c.name === 'Clothing');

      const sub = await Subcategory.create({
        name: `${brand.name} Accessories`,
        slug: `${brand.slug}-accessories`,
        category: category?._id,
      });
      subcategoryDocs.push(sub);
      console.log(`📑 Created subcategory ${sub.name}`);
    }

    // 5️⃣ PRODUCTS
    const productDocs = [];
    for (const brand of brandDocs) {
      let category =
        brand.name === 'Apple' || brand.name === 'Samsung'
          ? categoryDocs.find((c) => c.name === 'Phones')
          : brand.name === 'Sony'
            ? categoryDocs.find((c) => c.name === 'Headphones')
            : categoryDocs.find((c) => c.name === 'Clothing');

      for (let i = 0; i < 3; i++) {
        const title = `${brand.name} ${category.name} ${i + 1}`;
        const slug = slugify(title);
        const description = `Premium ${category.name.toLowerCase()} by ${brand.name}, known for top quality.`;
        const quantity = Math.floor(Math.random() * 100) + 5;
        const price = Number((Math.random() * 800 + 100).toFixed(2));

        const coverUrl = randomFrom(PRODUCT_IMAGES[category.name]);
        const coverId = `product-cover-${slug}-${Date.now()}`;
        const coverUpload = await uploadImageToCloudinaryFromUrl(
          coverUrl,
          'products',
          coverId
        );

        const galleryCount = Math.floor(Math.random() * 3) + 2;
        const galleryImages = [];
        for (let j = 0; j < galleryCount; j++) {
          const img = randomFrom(PRODUCT_IMAGES[category.name]);
          const pubId = `product-${slug}-img-${j + 1}-${Date.now()}`;
          const up = await uploadImageToCloudinaryFromUrl(
            img,
            'products',
            pubId
          );
          galleryImages.push(up.public_id);
        }

        const product = await Product.create({
          title,
          slug,
          description,
          quantity,
          price,
          category: category._id,
          brand: brand._id,
          imageCover: coverUpload.public_id,
          images: galleryImages,
          colors: ['black', 'white', 'blue', 'red'],
        });

        productDocs.push(product);
        console.log(`📦 Created product ${product.title}`);
      }
    }

    // 6️⃣ REVIEWS
    for (let i = 0; i < 10; i++) {
      const product = randomFrom(productDocs);
      await Review.create({
        title: `Review ${i + 1}`,
        rating: Math.floor(Math.random() * 5) + 1,
        user: normalUser._id,
        product: product._id,
      });
    }
    console.log('⭐ Reviews created.');

    // 7️⃣ COUPON
    await Coupon.create({
      name: 'SUMMER25',
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      discount: 25,
    });
    console.log('🎟️ Coupon created.');

    console.log('✅ Seeding finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

// =================== DELETE DATA ===================
async function deleteData() {
  try {
    console.log('🗑️ Deleting data and Cloudinary resources under shoply/...');

    await Promise.all([
      Brand.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      User.deleteMany(),
      Subcategory.deleteMany(),
      Review.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
      Coupon.deleteMany(),
    ]);

    await cloudinary.api.delete_resources_by_prefix(MAIN_FOLDER);
    console.log('✅ Cloudinary resources deleted.');
    console.log('✅ MongoDB data deleted.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Delete error:', err);
    process.exit(1);
  }
}

// =================== RUN ===================
(async () => {
  await connectDB();
  const arg = process.argv[2];
  if (arg === '--import') await importData();
  else if (arg === '--delete') await deleteData();
  else
    console.log('Usage: node seeder.js --import  OR  node seeder.js --delete');
})();
