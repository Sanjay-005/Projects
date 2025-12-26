E-commerce Web Application (MERN + Azure AI Search)
A full-stack E-Commerce Web Application built using the MERN stack with Azure AI Search integration for fast and intelligent product search, autocomplete suggestions, and filtering.
The application supports role-based access control, admin product management, bulk uploads, and a secure authentication system.

🚀 Live Demo
Frontend (Vercel):👉 https://ecommerce-rho-peach.vercel.app/
Backend API (Render):👉 https://ecommerce-backend-pznt.onrender.com/

📌 Features

👤 User Features

User registration and login (JWT authentication)

Browse products with filters (price, category, sorting)

Search products using Azure AI Search

Autocomplete & search suggestions

View product details

Add products to cart

Place orders

🛠 Admin Features

Secure admin login

Create, update, and delete products

Bulk product upload via Excel file

Automatic sync between MongoDB and Azure Search

Role-based access enforcement (backend + frontend)

🧠 Search & Indexing (Azure AI Search)

Full-text product search

Autocomplete suggestions

Indexed fields:

id

name

price

category

image

images

Automatic index update on:

Product creation

Product update

Product deletion

🏗️ Tech Stack

Frontend

React (Vite)

JavaScript (ES6+)

CSS

Axios

Backend

Node.js

Express.js

MongoDB + Mongoose

JWT Authentication

Multer (file uploads)

Excel parsing (xlsx)

Cloud & Deployment

Azure AI Search – Search & autocomplete

MongoDB Atlas – Database

Vercel – Frontend hosting

Render – Backend hosting

🔐 Authentication & Authorization

JWT-based authentication

Role field in user model (user / admin)

Protected routes using middleware

Admin-only access for:

Product management

Bulk uploads

Index updates

📂 Project Structure

ecommerce-app/
├── client/                 # Frontend (React)
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
├── server/                 # Backend (Node + Express)
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & role middleware
│   ├── utils/              # Azure Search utilities
│   ├── importToAzureSearch.js
│   └── index.js
│
└── README.md

📥 Bulk Product Upload (Excel)

Admins can upload products in bulk using an Excel file.

Required Excel Columns (Order):

id | name | price | category | image | images

Products are saved to MongoDB and automatically indexed in Azure Search

🧪 API Highlights

POST /api/users/login – User/Admin login

GET /api/products – Fetch products

GET /api/products/search/results – Azure search

POST /api/products – Admin: add product

POST /api/products/bulk-upload – Admin: bulk upload

📈 What This Project Demonstrates :

Full-stack development skills

Real-world cloud service integration (Azure AI Search)

Secure authentication & authorization

Scalable search architecture

Clean API design

Production deployment experience

👨‍💻 Author

Sanjay.S
B.Tech Student | Full-Stack Developer
Skills: MERN Stack, Azure AI Search, Cloud Deployment
