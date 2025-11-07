# 🛒 Node.js E-Commerce API  

A feature-rich **E-Commerce REST API** built with **Node.js, Express, and MongoDB**. It includes authentication, product and order management, roles, security enhancements, optimized performance, and **payment processing (Stripe & Cash on Delivery).**  

## 🚀 Features  
- **User Authentication & Authorization** (JWT, password reset)  
- **Product Management** (Brands, Categories, Subcategories)  
- **Orders, Coupons & Wishlist**  
- **Role-Based Access (Admin & User)**  
- **Payment Integration**: 💳 **Stripe** & 💵 **Cash on Delivery (COD)**  
- **Security & Optimization** (Rate Limiting, XSS, HPP, Compression)  
- **Logging** with Morgan  
- **Image Uploads** using Multer & Sharp  
- **Global Error Handling & Code Linting (ESLint)**  

---

## 📂 Project Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/ali-mahmoud24/ecommerce-api.git
cd ecommerce-api
```

### 2️⃣ Install Dependencies  
```bash
npm install
```

### 3️⃣ Configure Environment Variables  
Create a `config.env` file in the root directory and add the required configurations:  
```env
# App Configurations
PORT=8000
NODE_ENV=development

BASE_URL=http://localhost:8000

# Database
DB_URI=mongodb+srv://[DB_USER]:[DB_PASSWORD]@cluster0.weu8p.mongodb.net/nodejs-ecommerce

# Cloudinary
CLOUDINARY_CLOUD_NAME=*************
CLOUDINARY_API_KEY=************
CLOUDINARY_API_SECRET=*********

# JWT
JWT_SECRET_KEY=the-secret-key-jwt-in
JWT_EXPIRE_TIME=90d

# Email Settings
EMAIL_HOST=*************
EMAIL_PORT=***
EMAIL_USER=************
EMAIL_PASSWORD=*******

# Payment Settings
STRIPE_SECRET_KEY=***************************************************************************
```

### 4️⃣ Start the Server  
For development mode:  
```bash
npm run start:dev
```

For production mode:  
```bash
npm run start:prod
```

---

## 📸 File Uploads Directory  

If you experience issues with missing upload directories, create the `uploads` folder manually.  
Run the following command:

```bash
mkdir -p uploads/{brands,categories,products,users}
```

This will generate the necessary nested folders:

📁 `uploads/`  
 ├── 📂 `brands/` (Stores brand images)  
 ├── 📂 `categories/` (Stores category images)  
 ├── 📂 `products/` (Stores product images)  
 ├── 📂 `users/` (Stores user profile images)  

Make sure to keep this folder **excluded from Git** to prevent accidental uploads.

---

## 🔥 API Endpoints
🔹 Full API documentation is available via **Postman Collection**
- https://documenter.getpostman.com/view/31557274/2sAYkDP1Sw

---

## 💳 Payment Methods  
### **1️⃣ Cash on Delivery (COD) 🏠**  
- Users can select **Cash on Delivery** when placing an order.  
- The order status remains **"Pending Payment"** until confirmed by an admin.  

### **2️⃣ Stripe Payment 💳**  
- Users can pay online using **Stripe Checkout**.  
- Orders are **automatically marked as paid** upon successful payment.  

---

## 🔒 Security & Best Practices  
- **CORS** with configured allowed origins  
- **XSS Protection**  
- **Rate Limiting & HPP Prevention**  
- **Global Error Handling Middleware**

---

## 📸 Image Uploads
- **Multer** for handling file uploads
- **Sharp** for optimizing images
