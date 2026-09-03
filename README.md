# 🛒 E‑Commerce Engine – AI Vector Search & Admin Dashboard

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> A modern, production-ready e-commerce platform with AI-powered vector search, Redis caching, and a complete admin dashboard — built with the MERN stack.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Core Workflows](#-core-workflows)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧾 Overview

**E‑Commerce Engine** is a full-featured, high-performance e-commerce platform designed for modern online retail. It combines a powerful admin dashboard with a seamless customer storefront, AI-powered semantic search, Redis caching for sub-50ms response times, and a complete order management system.

Built with the MERN stack and TypeScript, it delivers a production-ready experience with role-based access control, real-time inventory management, and comprehensive analytics.

---

## ✨ Features

### 🛒 Customer Storefront
- **Product Catalog** – Browse products with category filters and search.
- **AI Vector Search** – Semantic product discovery using MongoDB vector search.
- **Shopping Cart** – Add/remove items, update quantities, and view cart totals.
- **Checkout** – Complete orders with shipping details and payment method selection.
- **Order History** – View past orders with status tracking.

### 🔧 Admin Dashboard
- **Product Management** – Create, edit, delete, and search products.
- **Order Management** – View all orders, update status, and track fulfillment.
- **Customer Management** – View and manage registered users.
- **Analytics** – Revenue reports, order trends, category performance, and conversion rates.
- **Inventory Control** – Real-time stock tracking and low-stock alerts.

### ⚡ Performance & Caching
- **Redis Cache** – Implements cache-aside pattern for sub-50ms API responses.
- **Cache Invalidation** – Automatic cache clearing on product updates.
- **Vector Search** – AI-powered semantic search with fallback to text search.

### 🔐 Security & Access Control
- **JWT Authentication** – Secure login with token-based session management.
- **Role-Based Access** – Separate views and permissions for admins and regular users.
- **Password Hashing** – bcrypt for secure password storage.

---

## 🛠️ Tech Stack

| Category         | Technology                     |
|-------------------|----------------------------------|
| Frontend          | React 19, TypeScript, Vite 5    |
| Styling           | Tailwind CSS v3, CSS Modules    |
| State Management  | Redux Toolkit                   |
| Backend           | Node.js, Express.js, TypeScript |
| Database          | MongoDB (Atlas or Local)        |
| Caching           | Redis 7                         |
| Vector Search     | MongoDB Atlas Vector Search     |
| Authentication    | JWT, bcryptjs                   |
| Real-Time         | Socket.IO (cart/order sync)     |
| Containerization  | Docker, Docker Compose          |
| CI/CD             | GitHub Actions                  |

---

## 🧱 Architecture

- **Frontend** – React 19 with Vite for blazing-fast HMR; Redux Toolkit for global state; Tailwind CSS for modern, responsive UI.
- **Backend** – Express.js with a clean MVC-like structure; TypeScript for type safety; JWT-based authentication.
- **Database** – MongoDB with Mongoose ODM; vector indexes for AI-powered search.
- **Caching** – Redis implements the cache-aside pattern; TTL-based cache invalidation.
- **Real-Time** – Socket.IO for live cart updates and order confirmations.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 20+
- npm or yarn
- MongoDB (local or Atlas)
- Redis (optional – falls back gracefully)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ecom-engine.git
cd ecom-engine
```

### 2. Install dependencies
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 3. Configure environment variables
```bash
# Server
cp server/.env.example server/.env
# Edit .env with your MongoDB URI, JWT secret, and optional Redis/Google API keys

# Client
cp client/.env.example client/.env
```

### 4. Seed the database
```bash
cd server
npm run seed
```
This creates the admin user, test user, discount codes, and 100+ products.

---

## 🚀 Running the Application

### 1. Start the backend server
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`.

### 2. Start the frontend client
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`.

### 3. Access the application
Open `http://localhost:5173` in your browser.

### 4. Login with default credentials
- **Admin:** admin@nexus.io / admin123
- **User:** user@nexus.io / user123

---

## 🔄 Core Workflows

| Actor | Action               | Description                                                              |
|-------|----------------------|---------------------------------------------------------------------------|
| User  | Register             | Creates a new account with name, email, phone, and password.             |
| User  | Login                | Authenticates using JWT and redirects to store/dashboard.                |
| Admin | Add Product          | Creates a new product with name, category, price, stock, and image.      |
| Admin | Edit Product         | Updates product details; automatically invalidates Redis cache.          |
| Admin | View Orders          | Lists all orders with status and customer details.                       |
| Admin | Update Order Status  | Changes order status (pending → confirmed → shipped → delivered).        |
| Admin | View Analytics       | Sees revenue charts, category sales, and conversion rates.                |
| User  | Browse Products      | Searches and filters products in the storefront.                         |
| User  | Add to Cart          | Adds products to cart with real-time stock validation.                   |
| User  | Checkout             | Enters shipping details and places an order.                             |
| User  | View Orders          | Sees order history with status and order details.                        |
| User  | Edit Profile         | Updates name, phone, address in settings.                                |
| User  | Change Password      | Securely updates password with current password verification.           |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint                   | Description         | Access        |
|--------|-----------------------------|----------------------|---------------|
| POST   | `/api/auth/login`           | Login user           | Public        |
| POST   | `/api/auth/register`        | Register new user    | Public        |
| GET    | `/api/auth/me`               | Get current user     | Authenticated |
| PUT    | `/api/auth/profile`         | Update profile       | Authenticated |
| PUT    | `/api/auth/change-password` | Change password      | Authenticated |

### Products

| Method | Endpoint                | Description       | Access |
|--------|---------------------------|--------------------|--------|
| GET    | `/api/products`           | List products      | Public |
| GET    | `/api/products/:id`       | Get single product | Public |
| GET    | `/api/products/search`    | AI vector search    | Public |
| POST   | `/api/products`           | Create product      | Admin  |
| PUT    | `/api/products/:id`       | Update product      | Admin  |
| DELETE | `/api/products/:id`       | Delete product      | Admin  |

### Cart & Orders

| Method | Endpoint                             | Description         | Access        |
|--------|----------------------------------------|-----------------------|---------------|
| GET    | `/api/cart/:userId`                    | Get user's cart       | Authenticated |
| POST   | `/api/cart/:userId`                    | Add item to cart      | Authenticated |
| PUT    | `/api/cart/:userId/:productId`         | Update quantity       | Authenticated |
| DELETE | `/api/cart/:userId/:productId`         | Remove from cart      | Authenticated |
| POST   | `/api/orders/:userId`                  | Create order          | Authenticated |
| GET    | `/api/orders/user/:userId`             | Get user's orders     | Authenticated |
| GET    | `/api/orders/:orderId`                 | Get order details     | Authenticated |
| PUT    | `/api/orders/:orderId/status`          | Update status         | Admin         |

### Admin Only

| Method | Endpoint          | Description          | Access |
|--------|--------------------|------------------------|--------|
| GET    | `/api/users`       | List all users         | Admin  |
| GET    | `/api/analytics`   | Get analytics data     | Admin  |

---

## 📸 Screenshots

- **Login Page**
  ![Login Page](./screenshots/login.png)

- **Admin Dashboard**
  ![Admin Dashboard](./screenshots/dashboard.png)

- **Product Management**
  ![Product Management](./screenshots/products.png)

- **Customer Storefront**
  ![Customer Storefront](./screenshots/store.png)

- **Shopping Cart**
  ![Shopping Cart](./screenshots/cart.png)

- **Analytics**
  ![Analytics](./screenshots/analytics.png)

---

## 🗺️ Roadmap

- [x] User authentication (JWT + bcrypt)
- [x] Product catalog with category filters
- [x] Redis caching (cache-aside pattern)
- [x] Admin product management (CRUD)
- [x] Shopping cart with local state sync
- [x] Order placement with inventory validation
- [x] Admin order management (list, status update)
- [x] Customer management
- [x] Analytics dashboard (revenue, orders, categories)
- [x] AI vector search (MongoDB Atlas)
- [x] Role-based access control
- [x] User profile & settings
- [x] Docker containerization
- [x] GitHub Actions CI/CD
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Email notifications (order confirmation, shipping updates)
- [ ] Product reviews & ratings
- [ ] Wishlist functionality
- [ ] Real-time order tracking

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a Pull Request.

Please ensure your code adheres to the existing style and includes appropriate tests.

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

[GitHub](https://github.com/yourusername) · [LinkedIn](https://linkedin.com/in/yourusername) · [Portfolio](https://yourportfolio.com)
