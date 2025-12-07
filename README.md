# Fynd E-Commerce Admin Dashboard

## Localhost URL

Visit the admin dashboard at: [http://localhost:5173/](http://localhost:5173/)

---

## Getting Started

### Dependency Installation

```bash
npm install
```

### Start Command

```bash
npm run dev
```

The dashboard will run at http://localhost:5173/

---


## Admin Signup Endpoint

To create an admin user:

```bash
curl --location 'https://fynd-ecommerce-backend.onrender.com/api/auth/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
           "email": "adminemail@gmail.com",
           "username": "AdminUsername",
           "password": "12345678",
           "name": "Admin Name"
}'
```

---

## Page Overview

### Login Page (`src/pages/Login.jsx`)
- Secure login for admins.
- Supports **Google OAuth 2.0** sign-in and fallback to standard username/password login.
- Toast notifications used to provide immediate feedback for success or error.

### Stats Page (`src/pages/Stats.jsx`)
- Dashboard landing page displaying summary statistics.
- Shows total, active, and inactive counts for both categories and products.
- Only accessible to authenticated admins.

### Categories Page (`src/pages/Categories.jsx`)
- View, filter, add, edit, and toggle active/inactive status for product categories.
- Modal form for adding/editing categories.
- Toast messages show results of all actions.

### Products Page (`src/pages/Products.jsx`)
- Browse, filter (by category/status), and paginate all products.
- Toggle activation status and navigate to view/edit product details.
- Use of beautiful table/grid with action buttons.
- Toast messages for feedback.

### Add Product Page (`src/pages/AddProduct.jsx`)
- Create new products with form for title, description, category, price, discount, images, and status.
- Live **final price calculation** based on discount.
- Submit button shows spinner during creation, toast for results.

### View Product Page (`src/pages/ViewProduct.jsx`)
- Edit product info, update images, or delete images.
- All product fields (including price, discount, images) editable.
- Shows final price dynamically as discount changes.
- Toast for all operations, loading screens and feedback.

---

## Features

- **OAuth & Classic Login**: Choose Google sign-in for one-click convenience, or fallback to traditional username and password login if necessary.
- **Final Price Calculation**: Whenever you set a discount in a product form, the dashboard automatically displays the computed final price below.
- **User Feedback**: All user actions (success or error) use toast notifications for quick, pleasant feedback throughout the app.
- **Loading States**: All critical operations (fetching, uploading, submitting) show visual loading indicators.

---

## Example Dashboard Images

View example screenshots for the dashboard here:
[Google Drive Folder](https://drive.google.com/drive/folders/1zUF3Q-M1x5ocrZuanudN7NUVfvFas9mY)
