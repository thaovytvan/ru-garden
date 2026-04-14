# 🌿 Rú Garden - Houseplant E-commerce Ecosystem

Rú Garden is a full-stack e-commerce platform dedicated to tropical houseplants and green living solutions. Born from a passion for nature and technology, it connects urban dwellers with high-quality greenery through a modern, seamless digital experience.

## 📁 Project Structure

The project is organized into three main components:

- **`/frontend`**: The customer-facing storefront built with Next.js.
- **`/admin`**: A dedicated management portal for shop owners built with Vite & React.
- **`/backend`**: A robust API server handling business logic, database operations, and AI integrations.

---

## 🚀 Tech Stack

### Frontend (Storefront)
- **Framework**: `Next.js 16` (App Router)
- **UI Components**: `Radix UI Themes`, `Lucide React`
- **Styling**: `Tailwind CSS`, `CSS Modules`
- **Logic & State**: `TanStack Query`, `Axios`, `React Hook Form`
- **Animations**: `Framer Motion`
- **Real-time**: `Socket.io-client`

### Admin (Management Portal)
- **Framework**: `Vite` + `React 19`
- **Routing**: `React Router Dom`
- **Styling**: `Tailwind CSS`
- **Charts**: `Recharts` for sales and traffic analytics

### Backend (API Server)
- **Runtime & Framework**: `Node.js`, `Express 5`
- **ORM**: `Prisma` with `PostgreSQL`
- **AI**: `Google Generative AI (Gemini)` for automated plant care consultation
- **Files**: `Cloudinary` for optimized image storage
- **Communication**: `Socket.io` (real-time notifications), `Nodemailer` (email alerts)
- **Security**: `JWT`, `Bcrypt`, `Helmet`, `Express Rate Limit`

---

## ✨ Key Features

- **Storefront**:
    - AI-Powered Plant Consultant: Instant advice on plant care and diagnosis.
    - Responsive Product Catalog: Detailed categories, search, and filtering.
    - Smart Checkout: Voucher support, discount calculation, and order tracking.
    - Real-time Notifications: Dynamic updates on order status.
    - Blog Section: Guides and tips for green living.

- **Admin Portal**:
    - Product & Inventory Management (CRUD operations).
    - Order Fullfillment System with multiple statuses (Pending, Shipped, etc.).
    - Sales Analytics Dashboard with visual charts.
    - Role-Based Access Control (RBAC): Distinct permissions for Admin and Staff.
    - Customer Message Management.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Environment variables configured (see `.env.example` in each directory)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thaovytvan/ru-garden.git
   cd ru-garden
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Configure .env
   npx prisma generate
   npm run seed # Optional: seed initial data
   npm run dev
   ```

3. **Setup Admin**:
   ```bash
   cd ../admin
   npm install
   # Configure .env
   npm run dev
   ```

4. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   # Configure .env
   npm run dev
   ```

---

## 📝 Authors

**Thảo Vy** - *Initial Work & Developer*

---

## 🍃 "Nơi tình yêu thiên nhiên được nảy mầm và nuôi dưỡng."
