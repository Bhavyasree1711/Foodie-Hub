# 🍽️ FoodieHub - Online Restaurant Management System

A full-stack Restaurant Management System built with **React.js**, **Node.js**, **Express**, **MySQL**, and **Bootstrap 5**.

---

## 🚀 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React.js 18, Bootstrap 5, CSS3      |
| Backend   | Node.js, Express.js (MVC)           |
| Database  | MySQL 8                             |
| Auth      | JWT (JSON Web Tokens)               |
| Files     | Multer (image upload)               |
| HTTP      | Axios                               |

---

## 📁 Project Structure

```
rm/
├── backend/
│   ├── config/
│   │   ├── db.js              # MySQL connection pool
│   │   └── schema.sql         # DB schema + seed data
│   ├── controllers/           # Business logic (MVC)
│   │   ├── authController.js
│   │   ├── foodController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect, adminOnly, staffOrAdmin
│   │   └── upload.js          # Multer image upload
│   ├── routes/                # Express routers
│   ├── uploads/               # Uploaded images (auto-created)
│   ├── .env                   # Environment variables
│   ├── server.js              # Entry point
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/        # Reusable components
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── FoodCard.jsx
        │   ├── CartSidebar.jsx
        │   └── Loader.jsx
        ├── context/
        │   ├── AuthContext.jsx # Auth state & JWT
        │   └── CartContext.jsx # Cart state (localStorage)
        ├── pages/
        │   ├── Home.jsx
        │   ├── Menu.jsx        # Browse + filter + search
        │   ├── Cart.jsx        # Checkout + order placement
        │   ├── Orders.jsx      # Order history + status
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Profile.jsx
        │   └── admin/
        │       ├── AdminLayout.jsx      # Sidebar layout
        │       ├── AdminDashboard.jsx   # Stats + charts
        │       ├── ManageFood.jsx       # CRUD food items
        │       ├── ManageCategories.jsx # CRUD categories
        │       ├── ManageOrders.jsx     # View + update orders
        │       └── ManageUsers.jsx      # Manage user roles
        ├── services/
        │   └── api.js          # Axios API calls
        ├── styles/
        │   └── App.css         # Global styles
        ├── App.jsx             # Routes + providers
        └── index.js
```

---

## ⚙️ Setup Instructions

### 1. Database Setup

```bash
# Log into MySQL
mysql -u root -p

# Run the schema file
source /path/to/backend/config/schema.sql
```

Or run the contents of `backend/config/schema.sql` in MySQL Workbench.

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure .env
# Edit backend/.env and set your MySQL credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=restaurant_db
# JWT_SECRET=restaurant_jwt_secret_key_2024

# Start the server
npm run dev     # development (nodemon)
npm start       # production
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🔑 Default Credentials

| Role     | Email                      | Password  |
|----------|----------------------------|-----------|
| Admin    | admin@restaurant.com       | admin123  |
| Customer | Register via /register     | any       |

---

## 🎯 Features

### 👤 Customer
- Register & login with JWT
- Browse menu with category tabs
- Search & filter (veg/non-veg, category, keyword)
- Add to cart (persisted in localStorage)
- Checkout with delivery address & payment method
- View order history with real-time status tracker
- Dark mode toggle
- Responsive mobile UI

### 👑 Admin
- Dashboard with stats (orders, revenue, users, menu items)
- Top selling items & order breakdown
- Add / Edit / Delete food items with image upload
- Manage categories
- View all orders, update status (pending → delivered)
- View order details with items
- Manage user roles (customer, staff, admin)
- Collapsible sidebar layout

### 🧑‍🍳 Staff
- View all orders
- Update order status

---

## 🔗 API Endpoints

| Method | Endpoint                         | Auth   | Description           |
|--------|----------------------------------|--------|-----------------------|
| POST   | /api/auth/register               | Public | Register user         |
| POST   | /api/auth/login                  | Public | Login                 |
| GET    | /api/auth/profile                | User   | Get profile           |
| GET    | /api/categories                  | Public | List categories       |
| GET    | /api/food                        | Public | List food items       |
| POST   | /api/food                        | Admin  | Add food item         |
| PUT    | /api/food/:id                    | Admin  | Update food item      |
| DELETE | /api/food/:id                    | Admin  | Delete food item      |
| POST   | /api/orders                      | User   | Place order           |
| GET    | /api/orders/my                   | User   | My orders             |
| GET    | /api/orders                      | Staff  | All orders            |
| PUT    | /api/orders/:id/status           | Staff  | Update order status   |
| GET    | /api/admin/dashboard             | Admin  | Dashboard stats       |
| GET    | /api/admin/users                 | Admin  | List all users        |

---

## 🖼️ Image Upload

- Food item images are uploaded via multipart/form-data
- Stored in `backend/uploads/`
- Served at `http://localhost:5000/uploads/<filename>`
- Max file size: 5MB
- Allowed formats: JPEG, JPG, PNG, GIF, WebP

---

## 🌙 Dark Mode

Click the moon icon in the navbar to toggle dark mode. The preference applies instantly across the entire app.

---

## 📱 Responsive Design

Fully responsive layout using Bootstrap 5 grid system:
- Mobile: 1-2 columns
- Tablet: 2-3 columns  
- Desktop: 3-4 columns

---

## 🛠️ Environment Variables (backend/.env)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=restaurant_db
JWT_SECRET=restaurant_jwt_secret_key_2024
JWT_EXPIRES_IN=7d
NODE_ENV=development
```
