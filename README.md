# Brainly

A minimalist, full-stack second-brain application to capture, organize, and share your web resources (links, notes, tweets, and YouTube videos).

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript, Mongoose, Zod, JWT

---

## Setup & Running Locally

### 1. Backend Server
From the project root:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root:
   ```env
   PORT=3000
   MONGO_URL=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_sign_secret
   ```
3. Start in development mode (compiles TypeScript and runs node server):
   ```bash
   npm run dev
   ```

### 2. Frontend Client
Navigate to `/frontend`:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run Vite dev server:
   ```bash
   npm run dev
   ```
   The app will run locally on `http://localhost:5173`.

---

## Directory Structure
- `/src` - Backend server configuration, mongoose schemas, validation schemas (Zod), and token authorization middleware.
- `/frontend` - Vite configuration, components (Sidebar, Navbar, RightSidebar, Cards), services, and theme state hooks.
